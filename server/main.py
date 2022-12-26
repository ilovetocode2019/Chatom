import collections
import json
import logging

import asyncpg
import pywebpush
from aiohttp import web

import views
import utils
from views.events import EventCode

log = logging.getLogger("chatom.main")
logging.getLogger("urllib3").setLevel(logging.WARNING)

@web.middleware
async def default_headers(request, handler):
    response = await handler(request)
 
    if response is not None:
        response.headers.setdefault("Access-Control-Allow-Origin", "*")
        response.headers.setdefault("Access-Control-Allow-Headers", "*")
        response.headers.setdefault("Access-Control-Allow-Methods", "*")
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
        sse_subscriptions = self["sse_subscriptions"][user_id]

        for sse_subscription in sse_subscriptions:
            await sse_subscription.push(e, d)

        if not any([sse_subscription.is_alive for sse_subscription in sse_subscriptions]) and e == EventCode.MESSAGE_SEND:
            push_subscriptions = self["push_subscriptions"][user_id]

            for push_subscription in list(push_subscriptions.values()):
                try:
                    subscription_info = {
                        "endpoint": push_subscription["endpoint"],
                        "keys": {
                            "p256dh": push_subscription["p256dh"],
                            "auth": push_subscription["auth"]
                        }
                    }

                    data = {
                        "title": self["users"][d["author_id"]]["username"],
                        "body": d["content"],
                        "conversation_id": d["conversation_id"]
                    }

                    pywebpush.webpush(subscription_info, data=json.dumps(data), vapid_private_key=self["config"].vapid, vapid_claims={"sub": "mailto:chatomchat@outlook.com"})
                except pywebpush.WebPushException as exc:
                    log.error("Failed to send push notification to user ID %s", user_id, exc_info=exc)

                    self["push_subscriptions"][user_id].pop(push_subscription["endpoint"])

                    query = """DELETE FROM push_subscriptions
                               WHERE push_subscriptions.endpoint = $1;
                            """
                    await self["db"].execute(query, push_subscription["endpoint"])

async def init_app(config):
    app = Application(middlewares=[default_headers])

    log.info("Creating database connection...")

    app["db"] = await asyncpg.create_pool(config.database_uri)
    app["token"] = utils.TokenGenerator(config.token_secret)
    app["config"] = config

    with open("schema.sql", "r") as file:
        await app["db"].execute(file.read())

    app["users"] = {}
    app["conversations"] = {}
    app["conversation_members"] = {}
    app["user_conversations"] = {}
    app["push_subscriptions"] = {}
    app["sse_subscriptions"] = collections.defaultdict(list)

    log.info("Loading users from database...")

    query = """SELECT *
               FROM users;
            """
    users = await app["db"].fetch(query)

    for user in users:
        app["users"][user["id"]] = dict(user)
        app["user_conversations"][user["id"]] = {}
        app["push_subscriptions"][user["id"]] = {}

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

    for conversation_member in conversation_members:
        app["conversation_members"][conversation_member["conversation_id"]][conversation_member["user_id"]] = dict(conversation_member)
        app["user_conversations"][conversation_member["user_id"]][conversation_member["conversation_id"]] = dict(app["conversations"][conversation_member["conversation_id"]])

    log.info("Loading push subscriptions from database...")

    query = """SELECT *
               FROM push_subscriptions;
            """
    push_subscriptions = await app["db"].fetch(query)

    for push_subscription in push_subscriptions:
        app["push_subscriptions"][push_subscription["user_id"]][push_subscription["endpoint"]] = dict(push_subscription)

    views.router(app)

    log.info("Ready to go...")

    return app

def main():
    logging.basicConfig(level=logging.DEBUG)

    config = __import__("config")

    app = init_app(config)

    port = getattr(config, "port", 8080)
    web.run_app(app, port=port)

if __name__ == "__main__":
    main()
