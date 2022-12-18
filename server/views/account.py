import datetime
import json

import asyncpg
import bcrypt
from aiohttp import web

import utils
from .base import BaseView
from .events import EventCode

class Account(BaseView):
    @utils.requires_auth()
    async def get(self):
        return web.json_response({
            "id": self.user["id"],
            "email": self.user["email"],
            "username": self.user["username"],
            "created_at": self.user["created_at"].timestamp()
        })

    @utils.schema({
        "email": {"type": "string", "maxlength": 256},
        "username": {"type": "string", "maxlength": 50},
        "password": {"type": "string", "minlength": 8}
    })
    async def post(self):
        email = self.data["email"]
        username = self.data["username"]
        password = self.data["password"]

        hashed_password = await self.request.app.loop.run_in_executor(
            None,
            bcrypt.hashpw,
            password.encode("utf-8"),
            bcrypt.gensalt())

        now = datetime.datetime.utcnow()
        timestamp = now.timestamp()

        user_id = self.request.app["token"].create_id(timestamp)

        try:
            query = """INSERT INTO users (id, email, username, hashed_password, max_token_age, created_at)
                       VALUES ($1, $2, $3, $4, $5, $6)
                    """
            await self.request.app["db"].execute(
                query,
                user_id,
                email,
                username,
                hashed_password.decode("utf-8"),
                now,
                now
            )
        except asyncpg.UniqueViolationError:
            query = """SELECT *
                       FROM users
                       WHERE users.email = $1;
                    """

            if await self.request.app["db"].fetchrow(query, email):
                return web.Response(
                    body="This email address is already taken",
                    status=400
                )
                
            else:
                return web.Response(
                    body="This username is already taken",
                    status=400
                )

        self.request.app["users"][user_id] = {
            "id": user_id,
            "email": email,
            "username": username,
            "hashed_password": hashed_password.decode("utf-8"),
            "max_token_age": now,
            "created_at": now,
        }
        self.request.app["user_conversations"][user_id] = {}
        self.request.app["push_subscriptions"][user_id] = {}

        return web.json_response({
            "id": user_id,
            "email": email,
            "username": username,
            "created_at": timestamp,
            "token": self.request.app["token"].encode_token(user_id)
        })

    @utils.schema({
        "email": {"type": "string", "maxlength": 256},
        "username": {"type": "string", "maxlength": 50},
        "password": {"type": "string", "maxlength": 8},
        "current_password": {"type": "string"}
    }, require_all=False)
    @utils.requires_auth()
    async def patch(self):
        email = self.data.get("email")
        username = self.data.get("username")
        password = self.data.get("password")

        if email or password:
            current_password = self.data.get("current_password")

            if not current_password:
                return web.json_response(status=400)

            password_matches = await self.request.app.loop.run_in_executor(
                None,
                bcrypt.checkpw,
                current_password.encode("utf-8"),
                self.user["hashed_password"].encode("utf-8")
            )

            if not password_matches:
                return web.json_response(status=400)

            email = email or self.user["email"]
            username = username or self.user["username"]

        if password:
            hashed_password = await self.request.app.loop.run_in_executor(
                None,
                bcrypt.hashpw,
                password.encode("utf-8"),
                bcrypt.gensalt())

            max_token_age = datetime.datetime.utcnow()
        else:
            max_token_age = self.user["max_token_age"]
            hashed_password = self.user["hashed_password"].encode("utf-8")

        query = """UPDATE users
                   SET email = $1, username = $2, hashed_password = $3, max_token_age = $4
                   WHERE users.id = $5;
                """
        await self.request.app["db"].execute(
            query,
            email,
            username,
            hashed_password.decode("utf-8"),
            max_token_age,
            self.user["id"]
        )

        self.app["users"][self.user["id"]].update({
            "email": email,
            "username": username,
            "hashed_password": hashed_password,
            "max_token_age": max_token_age
        })

        if "password" in self.data:
            for subscription in self.request.app["sse_subscriptions"][self.user["id"]]:
                await subscription.push()
            return web.json_response({
                "token": self.request.app["token"].encode_token(self.user["id"])
            })
        else:
            return web.Response(status=204)

class AccountToken(BaseView):
    @utils.schema({
        "email": {"type": "string"},
        "password": {"type": "string"}
    })
    async def post(self):
        email = self.data["email"]
        password = self.data["password"]

        query = """SELECT *
                   FROM users
                   WHERE users.email = $1;
                """
        user = await self.request.app["db"].fetchrow(query, email)

        if not user:
            return web.json_response(
                body="This email or password is invalid.",
                status=400
            )

        password_matches = await self.request.app.loop.run_in_executor(
            None,
            bcrypt.checkpw,
            password.encode("utf-8"),
            user["hashed_password"].encode("utf-8")
        )

        if not password_matches:
            return web.json_response(
                body="This email or password is invalid.",
                status=400
            )

        return web.json_response({
            "token": self.request.app["token"].encode_token(user["id"])
        })

    @utils.requires_auth()
    async def delete(self):
        now = datetime.datetime.utcnow()

        query = """UPDATE users
                   SET max_token_age = $1
                   WHERE users.id = $2;
                """
        await self.request.app["db"].execute(query, now, self.user["id"])

        self.request.app["users"][self.user["id"]]["max_token_age"] = now

        return web.json_response({
            "token": self.request.app["token"].encode_token(self.user["id"])
        })
