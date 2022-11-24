import datetime
import json

import asyncpg
import bcrypt
from aiohttp import web

import utils
from .base import BaseView

class Users(BaseView):
    @utils.requires_auth()
    async def get(self):
        user_id = self.request.match_info.get("id")
        user = self.request.app["users"].get(user_id)

        if not user:
            return web.Response(
                body="User not found.",
                status=404
            )

        return web.json_response({
            "id": user["id"],
            "username": user["username"],
            "created_at": user["created_at"].timestamp()
        })

class UsersConversation(BaseView):
    @utils.requires_auth()
    async def get(self):
        user_id = self.request.match_info.get("id")
        user = self.request.app["users"].get(user_id)

        if not user:
            return web.Response(
                body="User not found.",
                status=404
            )

        for conversation in self.request.app["user_conversations"][self.user["id"]].values():
            members = self.request.app["conversation_members"][conversation["id"]]

            if (user["id"] == self.user["id"] and len(members) == 1) or (user["id"] in members and user["id"] != self.user["id"]):
                return web.json_response({
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
                })

        now = datetime.datetime.utcnow()
        timestamp = now.timestamp()

        conversation_id = self.request.app["token"].create_id(timestamp)
        name = None
        conversation_type = 1
        is_draft = True

        query = """INSERT INTO conversations (id, type, name, is_draft, created_at)
                   VALUES ($1, $2, $3, $4, $5);
                """
        await self.request.app["db"].execute(
            query,
            conversation_id,
            conversation_type,
            name,
            is_draft,
            now
        )

        query = """INSERT INTO conversation_members (conversation_id, user_id, joined_at)
                   VALUES ($1, $2, $3);
                """
        await self.request.app["db"].execute(query, conversation_id, self.user["id"], now)

        if user["id"] != self.user["id"]:
            await self.request.app["db"].execute(query, conversation_id, user["id"], now)

        conversation = {
            "id": conversation_id,
            "type": conversation_type,
            "name": name,
            "is_draft": is_draft,
            "created_at": now
        }

        self.request.app["conversations"][conversation_id] = conversation

        self.request.app["conversation_members"][conversation_id] = {
            self.user["id"]: {
                "conversation_id": conversation_id,
                "user_id": self.user["id"],
                "joined_at": now
            },
            user["id"]: {
                "conversation_id": conversation_id,
                "user_id": user["id"],
                "joined_at": now
            }
        }

        self.request.app["user_conversations"][self.user["id"]][conversation_id] = conversation
        self.request.app["user_conversations"][user["id"]][conversation_id] = conversation

        return web.json_response({
            "id": conversation["id"],
            "type": conversation["type"],
            "name": None,
            "created_at": conversation["created_at"].timestamp(),
            "members": {
                self.user["id"]: {
                    "conversation_id": conversation_id,
                    "user_id": self.user["id"],
                    "joined_at": timestamp
                },
                user["id"]: {
                    "conversation_id": conversation_id,
                    "user_id": user["id"],
                    "joined_at": timestamp
                }
            }
        })

class UsersUsername(BaseView):
    @utils.schema({
        "username": {"type": "string"}
    })
    @utils.requires_auth()
    async def post(self):
        username = self.data["username"]
     
        query = """SELECT *
                   FROM users
                   WHERE users.username = $1;
                """
        user = await self.request.app["db"].fetchrow(query, username)

        if not user:
            return web.Response(
                body="Username not found.",
                status=404
                )

        return web.json_response({
            "id": user["id"],
            "username": user["username"],
            "created_at": user["created_at"].timestamp()
        })
