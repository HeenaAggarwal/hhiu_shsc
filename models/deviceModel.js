var express = require('express');
var app = express();
var config = require('../config');
var mysql = require('mysql');
var helper = require('../common/helper');

var connection = mysql.createConnection({
    host: config.base_url,
    user: config.arr.db_username,
    password: config.arr.db_password,
    database: config.arr.db_name,
	debug             :  false

});

var config = require('../config');

/********************************************************************************
 ** Function            : registerNetwork
 ** Description         : This function create the network on the cloud
 ********************************************************************************/

exports.registerNetwork = function (postData, callback) {
    connection.query('INSERT INTO halo_device_network SET ?', postData, function (err, result) {
        //console.log(err);
        //console.log(result);
        callback(result);
    });
}

/********************************************************************************
 ** Function            : checkNetworkExist
 ** Description         : This function checks the network tht is already exists with the same name
 ********************************************************************************/

exports.checkNetworkExist = function (postData, callback) {
    connection.query('SELECT * from halo_device_network where network_name = ? AND network_created_by = ?', [postData.network_name, postData.network_created_by], function (err, rows, fields) {
        callback(rows.length);
    });
}

/********************************************************************************
 ** Function            : updateNetworkToken
 ** Description         : This function check network already exists with the same name
 ********************************************************************************/

exports.updateNetworkToken = function (rowId, networkToken, callback) {
    connection.query('UPDATE halo_device_network SET network_token = ? WHERE network_id = ?', [networkToken, rowId], function (err, result) {
        callback(result);
    });
}

/********************************************************************************
 ** Function            : insertRole
 ** Description         : This function insert the user role in user role table
 ********************************************************************************/

exports.insertRole = function (networkRoleData, callback){
    connection.query('INSERT INTO halo_user_role_in_network SET ?', networkRoleData, function (err, result) {
        callback(result);
    });
}

exports.check_token_exist = function (auth_token, callback){
    connection.query('SELECT count(auth_token) as c from halo_user where auth_token = ?', [auth_token], function (err, result) {
        //console.log(result[0].c);
        //console.log(err);
	callback(result[0].c);
        //callback(result);
    });
}

/********************************************************************************
 ** Function            : insertindevicetable
 ** Description         : This function insert all the device information in device table
 ********************************************************************************/


exports.insertindevicetable = function (setdata, callback){
     
     connection.query('INSERT INTO halo_device SET ?', setdata, function (err, rows, fields) {
      
        console.log(err);
	console.log(rows); 
         callback(rows);
     
         
    });
};


/********************************************************************************
 ** Function            : updateDeviceToken
 ** Description         : This function update the device table with device token
 ********************************************************************************/

exports.updateDeviceToken = function (rowId, deviceToken, callback) {
    connection.query('UPDATE halo_device SET device_token = ? WHERE device_id = ?', [deviceToken, rowId], function (err, result) {
        callback(result);
    });
};

exports.vaildate_device_mac = function (device_mac,serial_no, callback) {
connection.query('SELECT device_mac from halo_device where device_mac = ? and device_serial_no = ?', [device_mac,serial_no], function(err, rows, fields) {


     callback(rows);

    });
};


