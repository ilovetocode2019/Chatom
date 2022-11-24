from aiohttp import web

class BaseView(web.View):
    async def options(self):
        return web.Response(status=204)
