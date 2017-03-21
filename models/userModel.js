var express = require('express');
var app = express();
var config = require('../config');
var mysql = require('mysql');
var helper = require('../common/helper');

//create mysql connection
var connection = mysql.createConnection({
     
      host              :  config.base_url,
      user              :  config.arr.db_username,
      password          :  config.arr.db_password,
      database          :  config.arr.db_name,
      debug             :  false
});

connection.connect();
        
exports.validateEmail = function(user_email,callback){
   
    connection.query('SELECT * from halo_user where user_email = ?', [user_email],function(err,rows,fields){
    if(!err){
        callback(rows);
    } 
    else{
        console.log("user not found");
    }
    });
};

exports.validateLogin = function(req,callback){

var user_password = req.user_pwd;
var encrypted_passowrd = helper.encrypt(user_password);    
var user_email = req.user_email;

var con = connection.query('SELECT * from halo_user where (user_email = ? and user_password = ?) OR (user_email =? and user_otp = ?)',[user_email,encrypted_passowrd,user_email,user_password],function(err,rows,fields){
if(err){
    console.log(err);
}
else{
     callback(rows);
}
});
};


exports.validateOtpLogin = function(req,callback){

var user_email = req.user_email;
var password = req.user_pwd;
var con = connection.query('SELECT * from halo_user where user_email = ? and user_otp = ?',[user_email,password],function(err,rows,fields){
if(err){
    console.log(err);
}
else{
    callback(rows);
}
});
};

/********************************************************************************
 ** Function            : insertingdetails
 ** Description         : This function insert the user details in user table
 ********************************************************************************/

exports.insertingdetails = function (data, req, callback){
    
    connection.query('INSERT INTO halo_user SET ?', [data], function (err, result) {
    //console.log(err);    
    //console.log(result);    
    var id = result.insertId;
    callback(id);
    });
};

/********************************************************************************
 ** Function            : updateUserToken
 ** Description         : This function insert the usertoken in user table
 ********************************************************************************/

exports.updateUserToken = function (rowId, user_token, callback) {
    connection.query('UPDATE halo_user SET ? WHERE user_id = ?', [user_token, rowId], function (err, result) {
    callback(result);
    });
};

/********************************************************************************
 ** Function            : fetchingdetails
 ** Description         : This function fetch all the details of the user with userid
 ********************************************************************************/

exports.fetchingdetails = function (rowId, callback) {
    connection.query('SELECT * from halo_user where user_id = ?', [rowId], function (err, rows, fields) {
    callback(rows);
    });
};

exports.resetOtp = function(user_email){
    connection.query('update halo_user set otp_status = ? where user_email = ?', ["0",user_email], function (err, rows, fields) {
    //callback(rows);
}); 

}

exports.insertToken = function(token,user_id){
    connection.query('update halo_user set auth_token = ? where user_id = ?', [token,user_id]); 
    //callback(rows);
 
};

/********************************************************************************
 ** Function            : updatepasswordwithotp
 ** Description         : This function update the user status and user password 
 ********************************************************************************/


exports.updatepasswordwithotp = function (updatedata, user_id, callback) {


    connection.query('UPDATE halo_user SET ?  WHERE user_id = ?', [updatedata, user_id], function (err, result) {
        callback(result);

    });
};




