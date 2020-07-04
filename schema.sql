DROP TABLE IF EXISTS users;

CREATE table users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255)
);