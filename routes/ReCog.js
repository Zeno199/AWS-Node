/* for register */

var express = require('express');
var router = express.Router();
var async = require('async');



var UserPool =  require('amazon-cognito-identity-js/lib/CognitoUserPool.js');
var UserAtt =  require('amazon-cognito-identity-js/lib/CognitoUserAttribute');
var User =  require('amazon-cognito-identity-js/lib/CognitoUser');
var AWS = require('aws-sdk');

var poolData = {
    UserPoolId: '', // Your user pool id here
    ClientId: '' // Your client id here
};


// UserPool is not a function

router.post('/', function(req, res, next){

        var email = req.body.email;
        var username = req.body.username;
        var password = req.body.password;
        var attributeList = [];

        console.log('before Cog');
        var userPool = new UserPool(poolData);

        console.log('after Cog');

        var dataEmail = {
            Name: 'email',
            Value: email
        };

        var Names = {
            Name: 'name',
            Value: username
        };

        var attributeEmail = new UserAtt(dataEmail);
        var attributeName = new UserAtt(Names);

        attributeList.push(attributeEmail);
        attributeList.push(attributeName);

        console.log("Register User",username, email);

        userPool.signUp(username, password, attributeList, null, function(err, result) {
            if (err) {
                console.error(err);
                console.log(typeof err);
                res.render('register', {error : err});
            } else {
                var cognitoUser = result.user;
                console.log('user registered as ' + cognitoUser.getUsername());
                console.log(result)
                res.render('register', {success: 'Success'});
            }
        });

});

module.exports = router;
