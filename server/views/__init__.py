from .account import *
from .conversation import *
from .event import *
from .user import *

def router(app):
    app.router.add_view("/account", Account)
    app.router.add_view("/account/token", AccountToken)

    app.router.add_view(r"/users/{id:\d+}", Users)
    app.router.add_view(r"/users/{id:\d+}/conversation", UsersConversation)
    app.router.add_view(r"/users/username", UsersUsername)

    app.router.add_view(r"/conversations/{id:\d+}", Conversations)
    app.router.add_view(r"/conversations/{id:\d+}/messages", ConversationsMessages)

    app.router.add_view("/events", Events)
