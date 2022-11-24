import functools
import json

import cerberus
from aiohttp import web

def schema(schema, *, allow_unknown=True, require_all=True):
    validator = cerberus.Validator(schema, allow_unknown=allow_unknown, require_all=require_all)
    def inner(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            try:
                data = await self.request.json()
            except json.JSONDecodeError:
                return web.Response(status=400)

            if not validator.validate(data):
                return web.Response(status=400)

            self.data = data
            return await func(self, *args, **kwargs)

        return wrapper
    return inner
