'use strict';

// dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const app = express();
app.use( cors() );

app.get('/location', (request,response) => {
  let data = require('./data/location.json');
  let actualData = new Location(data[0]);
  response.status(200).json(actualData);
//   console.log('test');
});

function Location( obj ) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.formatted_query = obj.display_name;
//   this.search_query = request;
}



// app.put(), app.delete(), app.post()

app.use('*',(request,response) => {
    response.status(404).send('not sure what you want?');
});

app.use((error, request, response, next) => {
    console.log(error);
    response.status(500).send('you broke the server');
});

app.listen( PORT, () => console.log('The Server is running on port:', PORT));
