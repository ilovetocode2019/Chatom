from aiohttp import web

import utils
from .base import BaseView

class Push(BaseView):
    @utils.schema({
        "endpoint": {"type": "string"},
        "p256dh": {"type": "string"},
        "auth": {"type": "string"}
    })
    @utils.requires_auth()
    async def post(self):
        endpoint = self.data["endpoint"]
        p256dh = self.data["p256dh"]
        auth = self.data["auth"]

        if endpoint in self.request.app["push_subscriptions"][self.user["id"]]:
            return web.Response(status=201)

        query = """INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
                   VALUES ($1, $2, $3, $4);
                """
        await self.request.app["db"].execute(query, self.user["id"], endpoint, p256dh, auth)

        self.request.app["push_subscriptions"][self.user["id"]][endpoint] = {
            "user_id": self.user["id"],
            "endpoint": endpoint,
            "p256dh": p256dh,
            "auth": auth
        }

        return web.Response(status=201)
