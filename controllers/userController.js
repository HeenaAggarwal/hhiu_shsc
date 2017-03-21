var express = require('express');
var app = express();
var userModel = require('../models/userModel');
var helper = require('../common/helper');
var jwt = require('jsonwebtoken');
var formidable = require('formidable');
var config = require('../config');
var fs = require('file-system');
var nodemailer = require('nodemailer');
var deviceModel = require('../models/deviceModel');


exports.login = function (req, res) {
    
    var data = req.body;
    var user_email = req.body.user_email;

    userModel.validateEmail(user_email, function (emailResponse) {
        if (emailResponse.length > 0) {

            userModel.validateLogin(data, function (loginResponse) {
                if (loginResponse.length > 0) {
                    var authToken = helper.generateToken(loginResponse);

                    var status = true;
                    var message = {
                        "user_token": loginResponse[0].user_token,
                        "user_id" : loginResponse[0].user_id,
                        "user_otp": loginResponse[0].user_otp,
                        "otp_status": loginResponse[0].otp_status,
                        "userName": loginResponse[0].user_name,
                        "userPic": loginResponse[0].user_pic,
                        "token": authToken
                    }
                    var result = helper.sendResult(status, message);
                    res.send(result);
                }
                else {
                    var status = false;
                    var message = "Email and Password does not match";
                    var result = helper.sendResult(status, message);
                    res.send(result);
                }
            });

        }
        else {
            var status = false;
            var message = "You are not a member of Halo Network.Please Sign up to continue.";
            var result = helper.sendResult(status, message);
            res.send(result);
        }
    });


};


/********************************************************************************
 ** Function            : register
 ** Description         : With this Api user can signup
 ** Input Parameters    : email,fname,lname,password,pic
 ** Return Values       : status:-{True or False},data:-{this email_id already exists,{"status":true,"data":{"user_token":"sa_114_KJeR","user_name":"archie","user_pic":"ghh"}}
 ********************************************************************************/

exports.register = function (req, res) {
    //console.log(req);
    
    var form = new formidable.IncomingForm();
    //form.maxFieldsSize = 8 * 1024 * 1024;
    form.parse(req, function (err, fields, files) {
       
        //console.log(fields);
        
        var user_email = fields.user_email;
        var user_fname = fields.fname;
        var user_lname = fields.lname;
        var user_password = fields.password;
        var user_pic = files.pic.path;
        var pic_type = files.pic.type.substring(6);
        
        
        userModel.validateEmail(user_email, function (emailResponse) {
            if (emailResponse.length > 0) {
                var status = true;
                var message = "This email id already exists";
                var response = helper.sendResult(status, message);
                res.send(response);

            }
            else {
                var encryptedpassowrd = helper.encrypt(user_password);
                var date = new Date();
                var timestamp = date.getTime();
                var user_role = 'sa';
                var setdata = {user_first_name: user_fname, user_last_name: user_lname, user_email: user_email, user_password: encryptedpassowrd, user_account_status: 1, user_role: user_role, user_updated_on: timestamp};

                // inserting the user details
                userModel.insertingdetails(setdata, req, function (callback) {
                    var string = helper.randomNumber;
                    var user_id = callback;
                    var role_token = "hh";
                    var user_token = role_token + '_' + user_id + '_' + string;

                    fs.rename(user_pic, config.static_path + '/user_image/' + user_token +"."+pic_type, function (err) {
                        if (err) {
                            throw err;
                        }
                        else {
                            console.log('renamed complete');
                        }
                    });
                    var path = "/user_image/" + user_token+"."+pic_type;
                    var updatepic = {user_token: user_token, user_pic: path};

                    // updating user detail with the user_token
                    userModel.updateUserToken(user_id, updatepic, function (result) {
                        userModel.fetchingdetails(user_id, function (result_details) {
                            var message = {
                                "user_token": result_details[0].user_token,
                                "user_name": result_details[0].user_first_name,
                                "user_pic": result_details[0].user_pic
                            };
                            var status = true;
                            var response = helper.sendResult(status, message);
                            res.send(response);

                        });
                    });
                });
            }

        });
    });
};


/* *****************************************************
 ** Function            : forgotpassword
 ** Description         : With this Api user can recover his/her password
 ** Input Parameters    : email
 ** Return Values       : status:-{True or False},data:-{Mail has been sent to your emailid and this email id doesnt exist}
 ********************************************************************************/

exports.forgotpassword = function (req, res) {
    var user_email = req.body.email;
    //to check whether email exits or not
    userModel.validateEmail(user_email, function (response) {
        if (response.length > 0) {

            var date = new Date();
            var timestamp = date.getTime();
            var user_otp = helper.randomOtp;
            var otp_status = "1";

            var updatedata = {user_otp: user_otp, otp_sent_timestamp: timestamp, otp_status: otp_status}

            //update details with otp ,otpstatus,timestamp
            userModel.insertupdatedata(updatedata, user_email, function (callback) {

                var mailoption = helper.options;
                var transporter = nodemailer.createTransport(mailoption);
                var mailsetting = helper.mailOptions(user_email, user_otp);

                // sending mail to the user with otp
                transporter.sendMail(mailsetting, function (error, info) {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        var status = true;
                        var data = "We've sent a new password to your email address. ";
                        var response = helper.sendResult(status, data);
                        res.send(response);
                    }
                });
            });
        }
        else {
            var status = false;
            var data = "We couldn't find any record of the email address you entered";
            var response = helper.sendResult(status, data);
            res.send(response);
        }
    });
};


/********************************************************************************
 ** Function            : resetpassword
 ** Description         : With this Api user can reset his/her password
 ** Input Parameters    : user_pwd
 ** Return Values       : status:-{True or False},data:-{Your password has been reset successfully and Your session has been expired}
 ********************************************************************************/

exports.resetpassword = function (req, res) {

    var auth_token = req.headers.authorization;
        var user_id = req.body.user_id;
        deviceModel.check_token_exist(auth_token, function(response){
        if (response == 0){
        var decoded = jwt.verify(auth_token, config.secret, function(err, value){
        if (err){
        console.log(err);
                var status = false;
                var data = "Your token has expired";
                var response = helper.sendResult(status, data);
                res.send(response);
        }
        else {
            var user_pwd = req.body.user_pwd;
            var otp_status = "0";
            var encryptedpassowrd = helper.encrypt(user_pwd);
            var setdata = {user_password: encryptedpassowrd, otp_status: otp_status,user_otp:"0"};
                //updating user table with password and otp status
            userModel.updatepasswordwithotp(setdata, user_id, function (callback) {
            var status = true;
                        var data = "Your password has been reset successfully ";
                        var response = helper.sendResult(status, data);
                        res.send(response);
             });
        

        }
        });
        }   
        });            
                
};
                
                
                
    exports.logout = function (req, res) {
    var auth_token = req.headers.authorization;
    var user_id = req.body.user_id;
    userModel.insertToken(auth_token, user_id);
    var status = true;
    var message = "Successfully logged out";
    var response = helper.sendResult(status, message);
    res.send(response);
};








