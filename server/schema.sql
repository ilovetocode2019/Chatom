CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    hashed_password TEXT,
    max_token_age TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    type INT,
    name TEXT,
    is_draft BOOLEAN,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS conversation_members (
    conversation_id TEXT REFERENCES conversations ON DELETE CASCADE,
    user_id TEXT REFERENCES users ON DELETE CASCADE,
    joined_at TIMESTAMP,
    PRIMARY KEY(conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations ON DELETE CASCADE,
    author_id TEXT REFERENCES users ON DELETE NO ACTION,
    type INT,
    content TEXT,
    created_at TIMESTAMP
);
