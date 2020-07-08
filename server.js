'use strict';


//SQL Videos on https://frontrowviews.com/Home/Event/Play/5ec5bc82d28f0a0cf8044a19 @ 1:57:00

// dependencies
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');

//Define Port
const PORT = process.env.PORT || 3000;

// Create our App
const app = express();
const client = new pg.Client(process.env.DATABASE_URL);
app.use(cors());

////////////////// API Routes
app.get('/',homePageHandler);
app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/trails', trailsHandler);

app.get('/add',SQLaddHandler);
app.get('/reply',SQLreplyHandler);



//      _______.  ______      __      
//     /       | /  __  \    |  |     
//    |   (----`|  |  |  |   |  |     
//     \   \    |  |  |  |   |  |     
// .----)   |   |  `--'  '--.|  `----.
// |_______/     \_____\_____\_______|

//REMEMBER TO START THE PSQL SERVER BEFORE RUNNING NODEMON/STARTING THE SERVER "PGSTART" IN TERMINAL
client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`SQL Server is up on port ${PORT}.`)
        });
    })
    .catch(err => {
        throw `PG startup error: ${err.message}`;
    });

////////////////////////////////////////////// HOME
function homePageHandler(request, response) {
    response.status(200).send('good to go...');
};


//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ 

//      _______.  ______      __              ___       _______   _______  
//     /       | /  __  \    |  |            /   \     |       \ |       \ 
//    |   (----`|  |  |  |   |  |           /  ^  \    |  .--.  ||  .--.  |
//     \   \    |  |  |  |   |  |          /  /_\  \   |  |  |  ||  |  |  |
// .----)   |   |  `--'  '--.|  `----.    /  _____  \  |  '--'  ||  '--'  |
// |_______/     \_____\_____\_______|   /__/     \__\ |_______/ |_______/ 
                                                                        

////////////////////////////////////////////// SQL ADD

function SQLaddHandler(request, response){
    console.log(request.query);
    // console.log(client.SQL);
    const firstName = request.query.first_name;
    const lastName = request.query.last_name;
    const safeQuery = [cityName, lastName];


    const SQL = 'INSERT INTO users (first_name, last_name) VALUES ($1, $2)';
    const SQLtable = 'SELECT * FROM users;'

    console.log(SQL);
    console.log(SQLtable);

    client.query(SQL, safeQuery)
        .then( results => {
            response.status(200).json(results);
        })
        .catch( error => {
            response.status(500).send(error)
        });
};

////////////////////////////////////////////// SQL REPLY

function SQLreplyHandler(request, response) {
    const SQL = 'SELECT * from users';

    client.query(SQL)
        .then( results => {
            response.status(200).json(results.rows);
        })
        .catch( error => {response.status(500).send(error)});
};  

//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ 


                                                

////////////////////////////////////////////// LOCATION HANDLER SQL
// Example Lat/Lon for Data Type
// "lat": "47.6038321", 9 decimals 7 decimals:
// "lon": "-122.3300624", 10 digits, 7 decimals: numeric(10,5)
//CREATE TABLE cities (id SERIAL PRIMARY KEY, search_query VARCHAR(255), formatted_query VARCHAR(255), latitude NUMERIC(10,5), longitude NUMERIC(10,5));
function locationHandler(request, response) {
    console.log('///////////////////////////////////////////////////////////// NEW SEARCH /////////////////////////////////////////////////////////////////////')
    const SQL = 'SELECT * FROM cities WHERE search_query = $1';
    const safeQuery = [request.query.city];
    
    client.query(SQL,safeQuery)
    .then(results => {
        if(results.rowCount){
            console.log('Found in Database');
            response.status(200).send(results.rows[0]);
        }else{
            APIlocationHandler(request.query.city, response);
        }
    })
};

//Cache
// let locations ={};


////////////////////////////////////////////// LOCATION HANDLER API
function APIlocationHandler(city, response) {
    const API = 'https://us1.locationiq.com/v1/search.php';
    
    let queryObject = {
        key: process.env.GEOCODE,
        q: city,
        format: 'json'
    };
 
    console.log('API calling');
    superagent
      .get(API)
      .query(queryObject)
      .then(data => { 
        let locationData = new Location(data.body[0], city);
        cacheLocation(locationData)
          .then(potato => {
            response.status(200).send(potato);
          })
      })
      .catch( function(error){
        console.log(error);
        response.status(500).send('Something went wrong with Location Data')
      })
  }
  
  function cacheLocation(city, data){
    // It's going to write to the database
    const location = new Location(data[0]);
    const values = [city, location.formatted_query, location.latitude, location.longitude];
    const SQL = `INSERT INTO cities (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING *`;
    return client.query(SQL, values)
      .then(results => {
        console.log(results);
        return results.rows[0];
      })
  }

      function Location(obj, city) {
        this.search_query = city;
        this.formatted_query = obj.display_name;
        // this.formatted_query = obj.display_name + '           ---           ' + ' Lat: ' + obj.lat + ' Lon: ' + obj.lon;
        this.latitude = obj.lat;
        this.longitude = obj.lon;
    }


//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ LOCATION END

// ____    __    ____  _______     ___   .___________. __    __   _______ .______      
// \   \  /  \  /   / |   ____|   /   \  |           ||  |  |  | |   ____||   _  \     
//  \   \/    \/   /  |  |__     /  ^  \ `---|  |----`|  |__|  | |  |__   |  |_)  |    
//   \            /   |   __|   /  /_\  \    |  |     |   __   | |   __|  |      /     
//    \    /\    /    |  |____ /  _____  \   |  |     |  |  |  | |  |____ |  |\  \----.
//     \__/  \__/     |_______/__/     \__\  |__|     |__|  |__| |_______|| _| `._____|
                                                                                    

////////////////////////////////////////////// WEATHER
function weatherHandler(request, response) {

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
};


function Weather(dataBody) {
    this.time = new Date(dataBody.datetime).toDateString();
    this.forecast = dataBody.weather.description;

}
//\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ WEATHER END

// .___________..______          ___       __   __          _______.
// |           ||   _  \        /   \     |  | |  |        /       |
// `---|  |----`|  |_)  |      /  ^  \    |  | |  |       |   (----`
//     |  |     |      /      /  /_\  \   |  | |  |        \   \    
//     |  |     |  |\  \----./  _____  \  |  | |  `----.----)   |   
//     |__|     | _| `._____/__/     \__\ |__| |_______|_______/    
                                                                 
////////////////////////////////////////////// TRAILS
function trailsHandler(request, response) {
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
    };
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



////////////////////////////////////////////// OLD LOCATION
// function locationHandler(request, response) {
//     console.log('///////////////////////////////////////////////////////////// NEW SEARCH /////////////////////////////////////////////////////////////////////')
//     const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`;

//     superagent.get(API)
//         .then(data => {
//             console.log('////////////////////////// LINE 32 ///////////////////////// Location Data.Body: ', data.body[0], request.query.city);
//             let locationData = new Location(data.body[0], request.query.city);
//             response.status(200).send(locationData);
//         })
//         .catch(() => {
//             response.status(500).send('Something went wrong with your search selection!');
//         })
// };
//////////////////////////////////////////////

////////////////////////////////////////////// OLD LOCATION HANDLER API
// function APIlocationHandler(request, response) {
//     const API = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE}&q=${request.query.city}&format=json`;
    
//         superagent.get(API)
//             .then(data => {
//                 console.log('////////////////////////// LINE 32 ///////////////////////// Location Data.Body: ', data.body[0], request.query.city);
//                 let locationData = new Location(data.body[0], request.query.city);
//                 response.status(200).send(locationData);
//             })
//             .catch(() => {
//                 response.status(500).send('Something went wrong with your search selection!');
//             })
//     };
    
//     function Location(obj, citySearch) {
//         this.latitude = obj.lat;
//         this.longitude = obj.lon;
//         this.formatted_query = obj.display_name + '           ---           ' + ' Lat: ' + obj.lat + ' Lon: ' + obj.lon;
//         this.search_query = citySearch;
//     }