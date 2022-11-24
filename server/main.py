import collections
import logging

import asyncpg
from aiohttp import web

import views
import utils

from views.websocket import WebsocketCloseCode

log = logging.getLogger("chatom.main")

@web.middleware
async def default_headers(request, handler):
    response = await handler(request)
 
    if response is not None:
        response.headers.setdefault("Access-Control-Allow-Origin", "*")
        response.headers.setdefault("Access-Control-Allow-Headers", "*")
        return response

class Application(web.Application):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    async def get_available_users(self, user_id):
        users = {}
        for conversation_id in self["user_conversations"][user_id]:
            for user_id in self["conversation_members"][conversation_id]:
                if user_id not in users:
                    users[user_id] = self["users"][user_id]

        return users

    async def push_to_conversation(self, conversation_id, e, d={}):
        for conversation_member in self["conversation_members"][conversation_id]:
            await self.push_to_user(conversation_member, e, d)

    async def push_to_user(self, user_id, e, d={}):
        for subscription in self["subscriptions"][user_id]:
            await subscription.push(e, d)

async def init_app(config):
    app = Application(middlewares=[default_headers])

    log.info("Creating database connection...")

    app["db"] = await asyncpg.create_pool(config.database_uri)
    app["token"] = utils.TokenGenerator(config.token_secret)

    with open("schema.sql", "r") as file:
        await app["db"].execute(file.read())

    app["users"] = {}
    app["conversations"] = {}
    app["conversation_members"] = {}
    app["user_conversations"] = {}
    app["subscriptions"] = collections.defaultdict(list)

    log.info("Loading users from database...")

    query = """SELECT *
               FROM users;
            """
    users = await app["db"].fetch(query)

    for user in users:
        app["users"][user["id"]] = dict(user)
        app["user_conversations"][user["id"]] = {}

    log.info("Loading conversations from database...")

    query = """SELECT *
               FROM conversations;
            """
    conversations = await app["db"].fetch(query)

    for conversation in conversations:
        app["conversations"][conversation["id"]] = dict(conversation)
        app["conversation_members"][conversation["id"]] = {}

    log.info("Loading conversation members from database...")

    query = """SELECT *
               FROM conversation_members;
            """
    conversation_members = await app["db"].fetch(query)

    for conversation_member in await app["db"].fetch(query):
        app["conversation_members"][conversation_member["conversation_id"]][conversation_member["user_id"]] = dict(conversation_member)
        app["user_conversations"][conversation_member["user_id"]][conversation_member["conversation_id"]] = app["conversations"][conversation_member["conversation_id"]]

    views.router(app)

    log.info("Ready to go...")

    return app

def main():
    logging.basicConfig(level=logging.DEBUG)

    config = __import__("config")

    app = init_app(config)
    web.run_app(app)


if __name__ == "__main__":
    main()
