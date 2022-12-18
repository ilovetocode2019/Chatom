from .account import *
from .conversation import *
from .events import *
from .push import *
from .user import *

def router(app):
    app.router.add_view(r"/account", Account)
    app.router.add_view(r"/account/token", AccountToken)

    app.router.add_view(r"/users/{id:\d+}", Users)
    app.router.add_view(r"/users/{id:\d+}/conversation", UsersConversation)
    app.router.add_view(r"/users/username", UsersUsername)

    app.router.add_view(r"/conversations/{id:\d+}", Conversations)
    app.router.add_view(r"/conversations/{id:\d+}/messages", ConversationsMessages)

    app.router.add_view(r"/push", Push)
    app.router.add_view(r"/events", Events)
