import datetime

from aiohttp import web

import utils
from .base import BaseView
from .event import EventCode

class Conversations(web.View):
    @utils.requires_auth()
    async def get(self):
        conversation_id = self.request.match_info.get("id")
        conversation = self.request.app["user_conversations"].get(conversation_id)

        if not conversation:
            return web.Response(
                body="Conversation not found.",
                status=404
            )

        response = {
            "id": conversation["id"],
            "type": conversation["type"],
            "name": conversation["name"],
            "created_at": conversation["created_at"].timestamp(),
            "members": {}
        }

        for conversation_member in self.request.app["conversation_members"][conversation["id"]]:
            response["members"][conversation_member["member"]] = {
                "conversation_id": conversation_member["conversation_id"],
                "user_id": conversation_member["user_id"],
                "joined_at": conversation_member["joined_at"].timestamp()
            }

        return web.json_response(response)

class ConversationsMessages(BaseView):
    @utils.requires_auth()
    async def get(self):
        conversation_id = self.request.match_info.get("id")
        conversation = self.request.app["user_conversations"][self.user["id"]].get(conversation_id)

        if not conversation:
            return web.Response(
                body="Conversation not found.",
                status=404
            )

        query = """SELECT *
                   FROM messages
                   WHERE messages.conversation_id = $1;
                """
        messages = await self.request.app["db"].fetch(query, conversation_id)

        response = {}

        for message in messages:
            response[message["id"]] = {
                "id": message["id"],
                "conversation_id": message["conversation_id"],
                "author_id": message["author_id"],
                "type": message["type"],
                "content": message["content"],
                "created_at": message["created_at"].timestamp()
            }

        return web.json_response(response)

    @utils.schema({
        "content": {"type": "string", "maxlength": 4096}
    })
    @utils.requires_auth()
    async def post(self):
        content = self.data["content"]

        conversation_id = self.request.match_info.get("id")
        conversation = self.request.app["user_conversations"][self.user["id"]].get(conversation_id)

        if not conversation:
            return web.Response(
                body="Conversation not found.",
                status=404
            )

        now = datetime.datetime.utcnow()
        timestamp = now.timestamp()

        message_id = self.request.app["token"].create_id(timestamp)
        message_type = 1

        query = """INSERT INTO messages (id, conversation_id, author_id, type, content, created_at)
                   VALUES ($1, $2, $3, $4, $5, $6);
                """
        await self.request.app["db"].execute(query, message_id, conversation_id, self.user["id"], message_type, content, now)

        if conversation["is_draft"]:
            query = """UPDATE conversations
                       SET is_draft = $1
                       WHERE conversations.id = $2;
                    """
            await self.request.app["db"].execute(query, False, conversation["id"])

            conversation["is_draft"] = False

            for user_id in self.request.app["conversation_members"][conversation["id"]]:
                user = self.request.app["users"][user_id]

                await self.request.app.push_to_conversation(conversation["id"], EventCode.USER_AVAILABLE, {
                    "id": user["id"],
                    "username": user["username"],
                    "created_at": user["created_at"].timestamp()
                })
         

            await self.request.app.push_to_conversation(conversation["id"], EventCode.CONVERSATION_CREATE, {
                "id": conversation["id"],
                "type": conversation["type"],
                "name": None,
                "created_at": conversation["created_at"].timestamp(),
                "members": {
                    conversation_member["user_id"]: {
                        "conversation_id": conversation_member["conversation_id"],
                        "user_id": conversation_member["user_id"],
                        "joined_at": conversation_member["joined_at"].timestamp()
                    } for conversation_member in self.request.app["conversation_members"][conversation["id"]].values()
                }
            })

        await self.request.app.push_to_conversation(conversation["id"], EventCode.MESSAGE_SEND, {
            "id": message_id,
            "conversation_id": conversation["id"],
            "author_id": self.user["id"],
            "type": message_type,
            "content": content,
            "timestamp": timestamp
        })

        return web.json_response({
            "id": message_id,
            "conversation_id": conversation["id"],
            "author_id": self.user["id"],
            "type": message_type,
            "content": content,
            "created_at": timestamp
        })
