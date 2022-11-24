import functools
import time


class RateLimit:
    __slots__ = ("rate", "per", "_remaining", "_last")

    def __init__(self, rate, per):
        self.rate = rate
        self.per = per

        self._remaining = rate
        self._last = time.time()

    def update(self):
        current_time = time.time()

        if current_time > self._last + self.per:
            self._remaining = self.per

        if self._remaining == 0:
            return self.per - (current_time - self._last)

        self._remaining -= 1
        self._last = current_time

    def copy(self):
        return RateLimit(self.rate, self.per)


class RateLimitMapping:
    __slots__ = ("_cache", "_original")

    def __init__(self, original):
        self._original = original
        self._cache = {}

    def get_ratelimit(self, user_id):
        if user_id in self._cache:
            return self._cache[user_id]
        else:
            self._cache[user_id] = self._original.copy()
            return self._cache[user_id]

    @classmethod
    def from_ratelimit(cls, rate, per):
        ratelimit = RateLimit(rate, per)
        return cls(ratelimit)

def schema(rate, per):
    mapping = RateLimitMapping.from_ratelimit(rate, per)

    def inner(func):
        @functools.wraps(func)
        async def wrapper(self, *args, **kwargs):
            ratelimit = mapping.get_ratelimit()

            if not validator.validate(data):
                return web.Response(status=429)

            return await func(self, *args, **kwargs)

        return wrapper
    return inner
