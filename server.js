'use strict';

//////Stopped at 2:57:41 for this project on https://frontrowviews.com/Home/Event/Details/5ec5bbead28f0a0cf8041762  //

// dotenv, express, cors
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

const PORT = process.env.PORT || 3000;

// Create our App
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);

app.use(cors());

client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`SQL Server is up on port ${PORT}.`)
        })
    })

////////////////////////////////////////////// HOME
app.get('/', (request, response) => {
    response.send('Hello World...again');
});

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ 

// .______   .______       _______     ___       __  ___ 
// |   _  \  |   _  \     |   ____|   /   \     |  |/  / 
// |  |_)  | |  |_)  |    |  |__     /  ^  \    |  '  /  
// |   _  <  |      /     |   __|   /  /_\  \   |    <   
// |  |_)  | |  |\  \----.|  |____ /  _____  \  |  .  \  
// |______/  | _| `._____||_______/__/     \__\ |__|\__\ 
                                                     

////////////////////////////////////////////// LOCATION
app.get('/location', (request, response) => {
    console.log('///////////////////////////////////////////////////////////// NEW SEARCH /////////////////////////////////////////////////////////////////////')
    const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`;

    superagent.get(API)
        .then(data => {
            console.log('////////////////////////// LINE 32 ///////////////////////// Location Data.Body: ', data.body[0], request.query.city);
            let locationData = new Location(data.body[0], request.query.city);
            response.status(200).send(locationData);
        })
        .catch(() => {
            response.status(500).send('Something went wrong with your search selection!');
        })
});

function Location(obj, citySearch) {
    this.latitude = obj.lat;
    this.longitude = obj.lon;
    this.formatted_query = obj.display_name + '           ---           ' + ' Lat: ' + obj.lat + ' Lon: ' + obj.lon;
    this.search_query = citySearch;
}
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ LOCATION END

// .______   .______       _______     ___       __  ___ 
// |   _  \  |   _  \     |   ____|   /   \     |  |/  / 
// |  |_)  | |  |_)  |    |  |__     /  ^  \    |  '  /  
// |   _  <  |      /     |   __|   /  /_\  \   |    <   
// |  |_)  | |  |\  \----.|  |____ /  _____  \  |  .  \  
// |______/  | _| `._____||_______/__/     \__\ |__|\__\ 
                                                     


////////////////////////////////////////////// WEATHER
app.get('/weather', (request, response) => {

    const lat = request.query.latitude;
    const lon = request.query.longitude;

    const API = `https://api.weatherbit.io/v2.0/forecast/daily?&lat=${lat}&lon=${lon}&country=US&key=${process.env.WEATHER_API}`

    let newWeatherArray = [];

    superagent.get(API)
        // .query(queryObject)
        .then(data => {
            let weatherArray = data.body.data;
            let dailyForecast = weatherArray.map((data) =>  new Weather(data));
            response.status(200).send(dailyForecast);
            // console.log('//////////////////////// line 150 //////////////////////////////////// weatherArray: ', weatherArray);
            console.log('//////////////////////// line 150 //////////////////////////////////// dailyForecast: ', dailyForecast);
        })
        .catch(() => {
            response.status(500).send('Something is wrong with your Weather Data...')
        })
})


function Weather(dataBody) {
    this.time = new Date(dataBody.datetime).toDateString();
    this.forecast = dataBody.weather.description;

}
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ WEATHER END

// .______   .______       _______     ___       __  ___ 
// |   _  \  |   _  \     |   ____|   /   \     |  |/  / 
// |  |_)  | |  |_)  |    |  |__     /  ^  \    |  '  /  
// |   _  <  |      /     |   __|   /  /_\  \   |    <   
// |  |_)  | |  |\  \----.|  |____ /  _____  \  |  .  \  
// |______/  | _| `._____||_______/__/     \__\ |__|\__\ 
                                                     


////////////////////////////////////////////// TRAILS
app.get('/trails', (request, response) => {
    const API = 'https://www.hikingproject.com/data/get-trails'
    
    let queryObject = {
        lat:request.query.latitude,
        lon:request.query.longitude,
        key: process.env.TRAIL_API_KEY,
    };

    superagent.get(API)
        .query(queryObject)
        .then(data => {
            let hikingData = data.body.trails;
            let hikingArray = hikingData.map((data) =>  new Trails(data));
            response.status(200).send(hikingArray);
            console.log('//////////////////////// line 212 //////////////////////////////////// hikingArray: ', hikingArray);
        })
        .catch(() => {
            response.status(500).send('Something is wrong with your Trails search... You basically walked down the wrong trail...')
        })
        
        
        function Trails(obj) {
            this.name = obj.name;
            this.location = obj.location;
            this.length = obj.length;
            this.stars = obj.stars;
            this.star_votes = obj.starVotes;
            this.summary = obj.summary;
            this.trail_url = obj.url;
            this.conditions = obj.conditionDetails;
            // this.condition_date = Date.parse(obj.conditionDate).toDateString();
            this.condition_date = new Date(obj.conditionDate.slice(0, 10)).toDateString();
            this.condition_time = obj.conditionDate.slice(11, 19);
        };
    })
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ TRAILS END

// .______   .______       _______     ___       __  ___ 
// |   _  \  |   _  \     |   ____|   /   \     |  |/  / 
// |  |_)  | |  |_)  |    |  |__     /  ^  \    |  '  /  
// |   _  <  |      /     |   __|   /  /_\  \   |    <   
// |  |_)  | |  |\  \----.|  |____ /  _____  \  |  .  \  
// |______/  | _| `._____||_______/__/     \__\ |__|\__\ 
                                                     

////////////////////////////////////////////// 

app.use('*', (request, response) => {
    response.status(404).send('404: Not sure what you want?');
});

app.use((error, request, response, next) => {
    console.log(error);
    response.status(500).send('500: Minions broke the server somehow...');
});

app.listen(PORT, () => console.log('Server is running on port', PORT));

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


// .______   .______       _______     ___       __  ___ 
// |   _  \  |   _  \     |   ____|   /   \     |  |/  / 
// |  |_)  | |  |_)  |    |  |__     /  ^  \    |  '  /  
// |   _  <  |      /     |   __|   /  /_\  \   |    <   
// |  |_)  | |  |\  \----.|  |____ /  _____  \  |  .  \  
// |______/  | _| `._____||_______/__/     \__\ |__|\__\ 
        

//------------Celcius to Farenheit Calc----------//
// function convertToF(celsius) {
//     return celsius * 9/5 + 32;
// };




    //------Today's Date Generator--------//
    // const today = new Date();
    // const this_day = String(today.getDate()).padStart(2, '0');
    // const this_month = String(today.getMonth() + 1).padStart(2, '0');
    // const this_year = today.getFullYear();
    // const start_date = this_year + '-' + this_month + '-' + this_day;

    // let dateArray = []
    // let i;
    // for(i = 0; i < 8; i++) {
    //     let d = new Date();
    //     d.setDate(d.getDate() + i);
    //     let end_day = String(d.getDate()).padStart(2, '0');
    //     let end_month = String(d.getMonth() + 1).padStart(2, '0');
    //     let end_year = d.getFullYear();
    //     let end_date = end_year + '-' + end_month + '-' + end_day;
    //     dateArray.push(end_date);

    // };
    // console.log(dateArray);

    //------Future Date Generator----------//
    // const d = new Date();
    // d.setDate(d.getDate() + 1);
    // const end_day = String(d.getDate()).padStart(2, '0');
    // const end_month = String(d.getMonth() + 1).padStart(2, '0');
    // const end_year = d.getFullYear();
    // const end_date = end_year + '-' + end_month + '-' + end_day;

    // console.log('Today\'s Date: ' + start_date);
    // console.log('+7 Days From Today: ' + end_date);




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