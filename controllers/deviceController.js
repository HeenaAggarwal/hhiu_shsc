var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var lambdarule = require('../common/lambdarule');
var helper = require('../common/helper');
var deviceModel = require('../models/deviceModel');
var config = require('../config');
var jwt = require('jsonwebtoken');
var userModel = require('../models/userModel');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

/********************************************************************************
 ** Function            : addNetwork
 ** Description         : With this Api user can add the network for the device
 ** Input Parameters    : networkname, lat long
 ** Return Values       : status:-{True or False},data:-{Network is added, Network name should be unique}
 ********************************************************************************/

exports.addNetwork = function (req, res) {

    var auth_token = req.headers.authorization;
    var lat = req.body.lat;
    var long = req.body.long;
    var user_id = req.body.user_id;
    var networkName = req.body.networkname;

    deviceModel.check_token_exist(auth_token, function (response) {
        if (response == 0) {
            var decoded = jwt.verify(auth_token, config.secret, function (err, value) {
                if (err) {
                    console.log(err);
                    var status = false;
                    var data = "Your token has expired";
                    var response = helper.sendResult(status, data);
                    res.send(response);
                }
                else {
                    var date = new Date();
                    userModel.fetchingdetails(user_id, function (result) {
                        var user_token = result[0].user_token;
                        var timestamp = date.getTime(); // current timestamp
                        var randomNumber = helper.randomNumber; //generate random string from device token
                        var postData = {network_name: networkName, network_lat: lat, network_long: long, network_created_by: user_token, network_created_on: timestamp, user_id_fk: user_id};
                        deviceModel.checkNetworkExist(postData, function (result) {
                            if (result > 0) {
                                var status = false;
                                var data = "Network name should be unique";
                                var response = helper.sendResult(status, data);
                                res.send(response);

                            } else {
                                deviceModel.registerNetwork(postData, function (result) {
                                    var networkId = result.insertId;
                                    var networkToken = 'nt_' + networkId + '_' + randomNumber;
                                    deviceModel.updateNetworkToken(networkId, networkToken, function (result) {
                                        var networkRoleData = {user_token: user_token, user_role: "sa", network_token: networkToken, user_created_on: timestamp, user_network_status: 1, network_id_fk: networkId};
                                        deviceModel.insertRole(networkRoleData, function (result) {
                                            var status = true;
                                            var data = "Network is added";
                                            var response = helper.sendResult(status, data);
                                            res.send(response);
                                        });
                                    });
                                });
                            }
                        });
                    });
                }

            });
        }

    });
};
/********************************************************************************
 ** Function            : adddevice
 ** Description         : With this Api user can add the device in the particular network
 ** Input Parameters    : device_active_status ,network_token,device_ip ,network_id_fk
 ** Return Values       : status:-{True or False},data:-{Device is added successfully, }
 ********************************************************************************/


exports.adddevice = function (req, res) {


    var userId = req.body.user_id;
    var device_name = req.body.device_name;
    var device_mac = req.body.device_mac;
    var serial_no = req.body.serial_no;
    var date = new Date();
    var timestamp = date.getTime();
    var device_ip = req.body.device_ip;
    var network_token = req.body.network_token;
    var network_id = req.body.nw_id;
    var auth_token = req.headers.authorization;
    var device_default_mode = 'home';
    deviceModel.check_token_exist(auth_token, function (response) {
        if (response == 0) {

            var decoded = jwt.verify(auth_token, config.secret, function (err, value) {
                if (err) {
                    console.log(err);
                    var status = false;
                    var data = "Your token has expired";
                    var response = helper.sendResult(status, data);
                    res.send(response);
                }
                else
                {

                    var setdata = {device_name: device_name,
                        device_mac: device_mac,
                        network_token: network_token,
                        created_on_date: timestamp,
                        network_id_fk: network_id,
                        device_serial_no: serial_no,
                        device_active_mode: device_default_mode
                    };

			
                    deviceModel.vaildate_device_mac(device_mac, serial_no, function (response) {
                        if (response.length > 0) {
                            var status = false;
                            var data = "Device Mac should be unique";
                            var response = helper.sendResult(status, data);
                            res.send(response);
                        } else
                        {
                            //  inserting data in device table
                            deviceModel.insertindevicetable(setdata, function (result) {

				console.log(result);
                                var randomNumber = helper.randomNumber;
                                var deviceID = result.insertId;
                                var deviceToken = 'dv_' + deviceID + '_' + randomNumber;
                                deviceModel.updateDeviceToken(deviceID, deviceToken, function (result) {
                                    var status = true;
                                    var data = "Device is added successfully";
                                    var response = helper.sendResult(status, data);

                                    ////AWS IOT:- CREATE TOPIC RULE WHILE ADDING THE DEVICE ///

                                    var callAwsIot = lambdarule.lambda(serial_no);
                                    console.log(callAwsIot);

                                    ////END :- createTopicRule operation/////  


                                    res.send(response);

                                });
                            });
                        }
                    });
                }
            });
        }
    });
};






