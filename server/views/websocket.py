import asyncio
import json
import secrets
import traceback

import aiohttp
import itsdangerous
from aiohttp import web

class WebsocketOPCode:
    HELLO = 1
    IDENTIFY = 2
    READY = 3
    RESUMED = 4
    HEARTBEAT = 5

class WebsocketCloseCode:
    INVALID_DATA = 4001
    INVALID_OPCODE = 4002
    INVALID_TOKEN = 4003
    INVALID_SESSION = 4004
    INVALID_INCREMENET = 4005
    HEARTBEAT_TIMEOUT = 4006
    INTERNAL_ERROR = 4007
    SERVER_SHUTDOWN = 4008

class WebsocketSession:
    HEARTBEAT_INTERVAL = 60

    def __init__(self, session_id, app, user):
        self.id = session_id
        self.app = app
        self.user = user

        self._queue = asyncio.Queue()
        self.inc = 0

        self.ws = None
        self.is_connected = asyncio.Event()

        self._dispatch_loop_task = app.loop.create_task(self._dispatch_loop())

    async def _dispatch_loop(self):
        while True:
            if not self.is_connected.is_set():
                await self.is_connected.wait()

            o, d = await self._queue.get()

            self.inc += 1

            message = {"o": o}

            if d:
                message["d"] = d

            message["i"] = self.inc

            await self.ws.send_json(message)

    async def send(self, o, d=None):
        await self._queue.put((o, d)) # This queues a message to be sent when a websocket is available

    async def run(self, ws):
        self.ws = ws
        self.is_connected.set()

        while True:
            try:
                message = await asyncio.wait_for(ws.receive(), timeout=self.HEARTBEAT_INTERVAL * 1.25)
            except asyncio.TimeoutError:
                await self.close(code=WebsocketCloseCode.HEARTBEAT_TIMEOUT, message="No heartbeat was sent in time.")
                return True

            if message.type == aiohttp.WSMsgType.TEXT:
                try:
                    content = json.loads(message.data)
                except json.JSONDecodeError:
                    await self.close(code=WebsocketCloseCode.INVALID_DATA, message="Message content could not be decoded.")
                    return False

                if "o" not in content:
                    await self.close(code=WebscoketCloseCode.INVALID_DATA, message="Message content must contain opcode.")
                    return False

                o = content["o"]
                d = content.get("d") or {}

                if not isinstance(d, dict):
                    await self.close(code=WebsocketCloseCode.INVALID_DATA, message="Message data must be a dict.")
                    return False

                if o not in OPCODE_MAPPING: # Opcode does not have an appopriate function
                    if o == WebsocketOPCode.IDENTIFY:
                        await self.close(code=WebsocketCloseCode.INVALD_OPCODE, message="Already identifed.")
                    else:
                        await self.close(code=WebsocketCloseCode.INVALID_OPCODE, message="Invalid opcode.")

                    return False

                await OPCODE_MAPPING[o](self, d) # Appropriate function for opcode
            elif message.type == aiohttp.WSMsgType.BINARY:
                await self.close(code=WebsocketCloseCode.INVALID_DATA, message="Message content could not be decoded.")
                return False
            elif message.type == aiohttp.WSMsgType.CLOSE:
                return ws.close_code != 1000 # Session will be closed if the close code is 1000 (normal)

    async def on_heartbeat(self):
        await self.send(WebesocketOPCode.HEARTBEAT)

    OPCODE_MAPPING = {
        WebsocketOPCode.HEARTBEAT: on_heartbeat
    }

    async def close(self, code, message):
        await self.ws.close(code=code, message=message)
        self.is_connected.clear()

    async def shutdown(self):
        self._dispatch_loop_task.cancel()

class WebsocketHandler(web.View):
    async def get(self):
        ws = web.WebSocketResponse()
        await ws.prepare(self.request)

        await ws.send_json({
            "o": WebsocketOPCode.HELLO,
            "d": {
                "heartbeat_interval": WebsocketSession.HEARTBEAT_INTERVAL
            },
            "i": None,
        })

        try:
            content = await asyncio.wait_for(ws.receive_json(), timeout=WebsocketSession.HEARTBEAT_INTERVAL * 1.25)
        except asyncio.TimeoutError:
            await ws.close(code=WebsocketCloseCode.HEARTBEAT_TIMEOUT, message="No heartbeat was sent in time.")
            return ws
        except (TypeError, ValueError):
            await ws.close(code=WebsocketCloseCode.INVALID_DATA, message="Message content could not be decoded.")
            return ws

        if "o" not in content:
            await ws.close(code=WebsocketCloseCode.INVALID_DATA, message="Message content must contain opcode.")
            return ws

        if content["o"] != WebsocketOPCode.IDENTIFY:
            await ws.close(code=WebsocketCloseCode.INVALID_OPCODE, message="Frst message must be identification.")
            return ws

        d = content.get("d") or {}

        if not isinstance(d, dict):
            await ws.close(code=WebsocketCloseCode.INVALID_DATA, message="Message data must be a dict.")

        if "token" not in d:
            await ws.close(code=WebsocketCloseCode.INVALID_DATA, message="Message data must contain token for identify opcode.")
            return ws

        token = d["token"]

        try:
            user_id, generated_at = self.request.app["token"].decode_token(token)
        except itsdangerous.BadData:
            await ws.close(code=WebsocketCloseCode.INVALID_TOKEN, message="Token is invalid.")
            return ws

        if user_id not in self.request.app["users"]:
            await ws.close(code=WebsocketCloseCode.INVALID_TOKEN, message="Token is invalid.")
            return ws
    
        user = self.request.app["users"][user_id]

        if generated_at.replace(tzinfo=None) < user["max_token_age"]:
            await ws.close(code=WebsocketCloseCode.INVALID_TOKEN, message="Token is invalid.")
            return ws

        session_id = d.get("session")
        inc = d.get("inc")

        if session_id:
            if user["id"] not in self.request.app["sessions"] or session_id not in self.request.app["sessions"][user["id"]]:
                await ws.close(code=WebsocketCloseCode.INVALID_SESSION, message="Invalid session.")
                return ws
            else:
                session = self.request.app["sessions"][user["id"]][session_id]

                if session.inc != inc:
                    await ws.close(code=WebsocketCloseCode.INVALID_INCREMENET, message="Session increment does not match.")
                    return ws

            await session.send(WebsocketOPCode.RESUMED) # This message will be at the end of the queue and will be sent after all missed events
        else:
            session_id = secrets.token_hex(16)

            while session_id in self.request.app["sessions"].get(user["id"], []):
                session_id = secrets.token_hex(16)

            session = WebsocketSession(session_id, self.request.app, user)

            if user["id"] not in self.request.app["sessions"]:
                self.request.app["sessions"][user["id"]] = {session_id: session}
            else:
                self.request.app["sessions"][user["id"]][session_id] = session

            # This message will be queued to send immediatly
            await session.send(WebsocketOPCode.READY, {
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "username": user["username"],
                    "created_at": int(user["created_at"].timestamp())
                },
                "session": session.id
            })

        try:
            result = await session.run(ws)
        except:
            traceback.print_exc()

            self.request.app["sessions"][user["id"]].pop(session.id)
            await session.shutdown()

            if not ws.closed:
                await ws.close(code=WebsocketCloseCode.INTERNAL_ERROR, message="An unknown internal occurred.")

            return

        if result is False:
            self.request.app["sessions"][user["id"]].pop(session.id)
            await session.shutdown()

            if not self.request.app["sessions"][user["id"]]:
                self.request.app["sessions"].pop(user["id"])

        return ws
