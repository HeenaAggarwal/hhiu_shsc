var randomstring = require('randomstring');
var jwt = require('jsonwebtoken');
var config = require('../config');
var random = require('random-js');

//generate random string fro device token
exports.randomNumber = randomstring.generate(4); 

exports.randomOtp = random.integer(789000, 987000);

exports.sendResult = function (status, data) {
    var response = {
        "status": status,
        "data": data
    };
    response = JSON.stringify(response);
    return response;
}

exports.encrypt = function (user_password){
      var pass  = (new Buffer(user_password).toString('base64'));
      return pass;
}

exports.decrypt = function (user_pic){
      var pass  = (new Buffer(user_pic, 'base64').toString('ascii'));
      return pass;
}

exports.generateToken = function (req){
  var token = jwt.sign({
    auth:  'magic',
    //agent: req.headers['user-agent'],
    exp:   Math.floor(Date.now() / 1000) + (86400),// Note: in seconds! 
  },config.secret)  // secret is defined in the environment variable JWT_SECRET 
  return token;
};

exports.options = {
  host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user:"", //your mail
        pass:"" // your password
    }
};

exports.mailOptions = function(user_email,otp) {
    var response = {
                from: '"Halo_Home" <archit.sisodia@vvdntech.com>',
                to: user_email,
                subject: 'Forgot Password',
                text: 'You have recieved a new mail',
                html: '<b>Hi You have a recievd an OTP </b>' + '<br> Please use this otp <br>' + otp
    };
    return response;
};



exports.send_err = function (err) {
    var response = {
        "status": false,
        "data": "Your token has expired"
    };
    response = JSON.stringify(response);
    return response;
};

