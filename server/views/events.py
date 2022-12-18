import asyncio
import json
import secrets
import time
import traceback

from aiohttp import web

import utils
from .base import BaseView

class EventCode:
    READY = 1
    HEARTBEAT = 2
    CONVERSATION_CREATE = 3
    MESSAGE_SEND = 4
    USER_AVAILABLE = 5

class EventHandler:
    HEARTBEAT_INTERVAL = 30

    def __init__(self, request):
        self.request = request

        self.stream = web.StreamResponse()
        self.stream.headers["Content-Type"] = "text/event-stream"
        self.stream.headers["Cache-Control"] = "no-cache"
        self.stream.headers["Connection"] = "keep-alive"
        self.stream.headers["X-Accel-Buffering"] = "no"

        self.stream.headers.setdefault("Access-Control-Allow-Origin", "*")
        self.stream.headers.setdefault("Access-Control-Allow-Headers", "*")
        self.stream.enable_chunked_encoding()

        self._queue = asyncio.Queue()

        self._inc = 1
        self._last_heartbeat = None

    @property
    def is_alive(self):
        return self.request.transport and not self.request.transport.is_closing()

    async def push(self, e, d={}):
        await self._queue.put((e, d))

    async def run(self):
        self._last_heartbeat = time.time()

        await self.stream.prepare(self.request)

        while True:
            try:
                e, d = await asyncio.wait_for(self._queue.get(), timeout=self.HEARTBEAT_INTERVAL - (time.time() - self._last_heartbeat))

                message = json.dumps({
                    "e": e,
                    "d": d,
                    "i": self._inc
                })
            except asyncio.TimeoutError:
                message = json.dumps({
                    "e": EventCode.HEARTBEAT,
                    "d": {},
                    "i": self._inc
                })

                self._last_heartbeat = time.time()

            try:
                await self.stream.write(f"data: {message}\r\n\r\n".encode("utf-8"))

                self._inc += 1
            except ConnectionResetError:
                return

class Events(BaseView):
    @utils.requires_auth()
    async def get(self):
        handler = EventHandler(self.request)

        message = {
            "id": self.user["id"],
            "email": self.user["email"],
            "username": self.user["username"],
            "created_at": self.user["created_at"].timestamp(),
            "users": {},
            "conversations": {}
        }

        available_users = await self.request.app.get_available_users(self.user["id"])

        for user in available_users.values():
            message["users"][user["id"]] = {
                "id": user["id"],
                "username": user["username"],
                "created_at": user["created_at"].timestamp()
            }

        for conversation in self.request.app["user_conversations"][self.user["id"]].values():
            if conversation["is_draft"]:
                continue

            members = self.request.app["conversation_members"][conversation["id"]]

            message["conversations"][conversation["id"]] = {
                "id": conversation["id"],
                "type": conversation["type"],
                "name": conversation["name"],
                "created_at": conversation["created_at"].timestamp(),
                "members": {
                    conversation_member["user_id"]: {
                        "conversation_id": conversation_member["conversation_id"],
                        "user_id": conversation_member["user_id"],
                        "joined_at": conversation_member["joined_at"].timestamp()
                    } for conversation_member in members.values()
                }
            }

        await handler.push(EventCode.READY, message)

        self.request.app["sse_subscriptions"][self.user["id"]].append(handler)

        await handler.run()

        self.request.app["sse_subscriptions"][self.user["id"]].remove(handler)
        return handler.stream
