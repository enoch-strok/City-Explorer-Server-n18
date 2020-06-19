'use strict';

// dotenv, express, cors
require('dotenv').config;
const express = require('express');
const cors = require('cors');

// this is MAGIC. Trust
// Anything from the .env file shows up here
const PORT = process.env.PORT;

// Get an "instance" of express as our app
const app = express();

app.use( cors() );