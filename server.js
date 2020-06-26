'use strict';

//////Stopped at 2:57:41 for this project on https://frontrowviews.com/Home/Event/Details/5ec5bbead28f0a0cf8041762  //

// dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());
const superagent = require('superagent');

//-------------HOME----------------------//

app.get('/', (request, response) => {
    response.send('Hello World...again');
});

//-------------LOCATION-------------------//
app.get('/location', (request, response) => {
    const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`;

    superagent.get(API)
        .then(data => {
            // console.log(data.body[0], request.query.city);
            let locationData = new Location(data.body[0], request.query.city);
            response.status(200).send(locationData);
        })
        .catch( () => {
            response.status(500).send('Something went wrong with your search selection!');
        })
});

function Location(obj, citySearch) {
    this.latitude = obj.lat;
    this.longitude = obj.lon;
    this.formatted_query = obj.display_name;
    this.search_query = citySearch;
}

//----------OLD CONSTRUCTOR WHEN USING JSON FAKE DATA OR LOCAL DATA---------------//
// function Location( obj, citySearch ) {
//     this.latitude = obj.lat;
//     this.longitude = obj.lon;
//     this.formatted_query = obj.display_name;
//     this.search_query = citySearch;
//   }

//------------NEW WEATHER API-------------------//

//Starts at 3:05

// app.get('/weather', (request, response) => {
//     const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`;

//     superagent.get(API)
//         .then(data => {
//             // console.log(data.body[0], request.query.city);
//             let allWeatherAPI = [];
//             let locationData = new Location(data.body[0], request.query.city);
//             response.status(200).send(locationData);
//         })
//         .catch( () => {
//             response.status(500).send('Something went wrong with your search selection!');
//         })

// });

// function Weather(obj) {
//     this.forecast = obj.weather.description;
//     this.time = obj.datetime;
// }


//--------------OLD WEATHER-------------------//
app.get('/weather', (request, response) => {
    let weatherJSONfile = require('./data/weather.json');
        let allWeather = weatherJSONfile.data.map(restObject => {
            return new Weather(restObject);
        })
        console.log(allWeather);
        response.status(200).json(allWeather);
    });


function Weather(obj) {
    this.forecast = obj.weather.description;
    this.time = obj.datetime;
}




//---------------OLD RESTAURANTS-----------------------------//
// $('thing').on('something', () => {})
// app.get('/restaurants', (request, response) => {
//     let data = require('./data/restaurants.json');

//     let allRestaurants = [];
//     data.nearby_restaurants.forEach( restObject => {
//       let restaurant = new Restaurant(restObject);
//       allRestaurants.push(restaurant);
//     });

//     response.status(200).json(allRestaurants);
//   });

//   function Restaurant(obj) {
//     this.restaurant = obj.restaurant.name;
//     this.locality = obj.restaurant.location.locality;
//     this.cuisines = obj.restaurant.cuisines;
//   }


// app.put(), app.delete(), app.post()

app.use('*', (request, response) => {
    response.status(404).send('404: Not sure what you want?');
});

app.use((error, request, response, next) => {
    console.log(error);
    response.status(500).send('500: Minions broke the server somehow...');
});

app.listen(PORT, () => console.log(`The Server is running on port ${PORT}`));