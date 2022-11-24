import base64
import functools
import time

import itsdangerous
from aiohttp import web

class Signer(itsdangerous.TimestampSigner):
    def get_timestamp(self):
        return int(time.time()) + 1

class TokenGenerator:
    def __init__(self, secret):
        self._signer = Signer(secret)

        self.epoch = 1640995200
        self.worker_id = 1
        self.process_id = 0
        self.inc = 1

    def create_id(self, now):
        timestamp = int(now * 1000 - self.epoch)
        self.inc += 1

        user_id = timestamp << 22
        user_id |= (self.worker_id) << 17
        user_id |= (self.process_id) << 12
        user_id |= self.inc

        return str(user_id)

    def encode_token(self, user_id):
        str_user_id = user_id
        base64_user_id = base64.b64encode(str_user_id.encode())
        return self._signer.sign(base64_user_id).decode()

    def decode_token(self, token):
        encoded_token = token.encode()
        data, time = self._signer.unsign(encoded_token, return_timestamp=True)

        base64_user_id = data.decode()
        user_id = base64.b64decode(base64_user_id).decode()
        return user_id, time

def requires_auth():
    def inner(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            auth_header = self.request.headers.get("Authorization")
            
            if not auth_header or not auth_header.startswith("Bearer "):
                return web.Response(status=401)

            try:
                user_id, generated_at = self.request.app["token"].decode_token(auth_header[7:])
            except itsdangerous.BadData:
                return web.Response(status=401)

            if user_id not in self.request.app["users"]:
                return web.Response(status=401)

            user = self.request.app["users"][user_id]

            if generated_at.replace(tzinfo=None) < user["max_token_age"]:
                return web.Response(status=401)

            self.user = self.request.app["users"][user_id]

            return await func(self, *args, **kwargs)

        return wrapper
    return inner
