//jshint esversion: 6

//Requiring Express and other relevant modules
require('dotenv').config();
const express = require('express');
const https = require('https');
const bodyParser  = require('body-parser');
const ejs = require("ejs");
const _ = require('lodash');

//Setting up the app
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
const port = 3000;
app.use(express.static("public"));
app.set("view engine", "ejs");

//Rendering Home template on root route
app.get("/", (req, res) => {

  res.render("home", {city: "", description: "", imgURL: "", temper1: "", humid: "", press: ""});

});


app.post ("/", (req, res) => {
  //Extracting city name from form request
  const city = req.body.cityName;
  //Formatting city name in proper way
  const capitalCity = _.capitalize(city);
  //Selecting units of weather details as metric
  const unit = "metric";
  //Creating URL for https request to openweathermap API
  const url ="https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=" + unit + "&appid=" + process.env.APIKEY;

  //Using https.get() method to query openweathermap API server for Weather details
  https.get(url, (response) => {
    //console.log(response.statusCode);
    //IF status code is 2XX, we extract the data
      if (response.statusCode >= 200 && response.statusCode < 300) {

        response.on("data", (data) => {
          //Parsing "data" to JSON as it is returned as hexadecimal format
          const weatherData = JSON.parse(data);

          //Extracting Temperature, Weather Description, icon, humidity and Pressure from received data
          var temp = weatherData.main.temp;
          var weatherDescription = weatherData.weather[0].description;
          const iconURL = "http://openweathermap.org/img/wn/" + weatherData.weather[0].icon + "@2x.png";
          const humidity = weatherData.main.humidity;
          const pressure = weatherData.main.pressure;

          //Sending data back to Home template
          res.render("home", {city: capitalCity, description: weatherDescription, imgURL: iconURL, temper1: temp, humid: humidity, press: pressure});
        });

      } else {
        //Staus code is not 2XX, that means incorrect city name was entered
        //console.log(response.statusCode);
        res.render("home", {city: "Incorrect City", description: "", imgURL: "", temper1: "", humid: "", press: ""});
      }

  });
});

app.listen(process.env.PORT || port, () => {
  console.log("Server is running on port: " + port);
});
