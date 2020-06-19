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


//--------------WEATHER-------------------//
app.get('/weather', (request,response) => {
    let weatherJSONfile = require('./data/weather.json');
    let allWeather = [];
    weatherJSONfile.data.forEach( restObject => {
        // console.log(restObject.weather.description);
        let weather = new Weather(restObject);
        // console.log('weather:',weather);
        allWeather.push(weather);
    })
    console.log(allWeather);
    response.status(200).json(allWeather);
});

function Weather( obj ) {
    this.forecast = obj.weather.description;
    this.time = obj.datetime;
    // this.time = obj.array.rh;
}




// $('thing').on('something', () => {})
app.get('/restaurants', (request, response) => {
    let data = require('./data/restaurants.json');
  
    let allRestaurants = [];
    data.nearby_restaurants.forEach( restObject => {
      let restaurant = new Restaurant(restObject);
      allRestaurants.push(restaurant);
    });
  
    response.status(200).json(allRestaurants);
  });
  
  function Restaurant(obj) {
    this.restaurant = obj.restaurant.name;
    this.locality = obj.restaurant.location.locality;
    this.cuisines = obj.restaurant.cuisines;
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

