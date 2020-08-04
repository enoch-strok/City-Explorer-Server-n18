DROP TABLE IF EXISTS cities;

CREATE table cities (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude decimal(10,7),
    longitude decimal(10,7)
);