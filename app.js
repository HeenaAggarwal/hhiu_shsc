var express = require('express');
var bodyParser = require('body-parser');
//var session = require('express-session');
//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
var app = express();

var routes = require('./routes/index');
app.use(bodyParser.json({limit :'50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));

/*app.use(session(
  {  cookieName: 'session',
  secret: '8oeQozTEDLDHcPJxXZpPCFgawqzFgXOEkpY52LOADt79yDVZ8qRoFyvb-8V_4MLP',
  resave: false,
  saveUninitialized: false
  // cookie:{maxAge:60000}
})
);
*/

app.use(express.static('public'));

routes.route(app);

app.listen(3000,function(){
    console.log('listening on 3000')
})

