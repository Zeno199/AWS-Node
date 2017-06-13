var express = require('express');
var router = express.Router();
var async = require('async');

var UserPool =  require('amazon-cognito-identity-js/lib/CognitoUserPool.js');
var UserAtt =  require('amazon-cognito-identity-js/lib/CognitoUserAttribute');
var User =  require('amazon-cognito-identity-js/lib/CognitoUser');
var AuDe = require('amazon-cognito-identity-js/lib/AuthenticationDetails');
var AWS = require('aws-sdk');

var poolData = {
    UserPoolId: '', // Your user pool id here
    ClientId: '' // Your client id here
};


router.post('/', function(req, res, next){



        var userPool = new UserPool(poolData);
        var userData = {
            Username: req.body.username,
            Pool: userPool
        };

        var cognitoUser = new User(userData);

        cognitoUser.confirmRegistration(req.body.tokens, true, function(err, result) {
            if (err) {
                console.log(err);
                res.render('register', {errors : err});
            }
            else{
                console.log('call result: ' + result);
                res.render('register', {success: 'SUCCESS'});

            }

        });


});

module.exports = router;
