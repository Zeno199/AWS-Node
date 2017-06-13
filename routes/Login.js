var express = require('express');
var router = express.Router();
var async = require('async');
var Promise = require('promise');
var dateTime = require('node-datetime');


var UserPool =  require('amazon-cognito-identity-js/lib/CognitoUserPool.js');
var UserAtt =  require('amazon-cognito-identity-js/lib/CognitoUserAttribute');
var User =  require('amazon-cognito-identity-js/lib/CognitoUser');
var AuDe = require('amazon-cognito-identity-js/lib/AuthenticationDetails');
var AWS = require('aws-sdk');


function P(contents){

  return new Promise(function(resolve, reject){
        resolve(contents);
  });
}


var poolData = {
    UserPoolId: '', // Your user pool id here
    ClientId: '' // Your client id here
};

// new
var AWS_ACCOUNT_ID =  '';
var AWS_REGION = '';
var COGNITO_IDENTITY_POOL_ID = '';
var cognitosync;
var IAM_ROLE_ARN =  '';
var COGNITO_DATASET_NAME = '';
var COGNITO_SYNC_TOKEN, COGNITO_SYNC_COUNT, COGNITO_IDENTITY_ID;

var userLoggedIn = false;

// UserPool is not a function


router.post('/', function(req, res, next){


      var authenticationData = {
          Username : req.body.username,
          Password : req.body.password,
      };

      var userPool = new UserPool(poolData);
      var userData = {
          Username : req.body.username,
          Pool : userPool
      };


      var authenticationDetails = new AuDe(authenticationData);

      var authenticationDetails = new AuDe(authenticationData);
      var userPool = new UserPool(poolData);
      var cognitoUser = new User(userData);


      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
              token = result.getAccessToken().getJwtToken();
              console.log('access token + ' + result.getAccessToken().getJwtToken());

              AWS.config.region = AWS_REGION;

              AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                  AccountId: AWS_ACCOUNT_ID, // required
                  RoleArn: IAM_ROLE_ARN,
                  IdentityPoolId : COGNITO_IDENTITY_POOL_ID, // your identity pool id here
                  Logins : {
                        '' : result.getIdToken().getJwtToken()
                  }
              });

              P(AWS_REGION).then(function(){


                AWS.config.credentials.get(function(err) {

                  if (err) console.log("credentials.get: "+ err, err.stack); // an error occurred
                  else{
                    COGNITO_IDENTITY_ID = AWS.config.credentials.identityId;
                    cognitosync = new AWS.CognitoSync();
                    cognitosync.listRecords({ DatasetName: COGNITO_DATASET_NAME,  IdentityId: COGNITO_IDENTITY_ID,
                      IdentityPoolId: COGNITO_IDENTITY_POOL_ID }, function(err, data) {

                        if (err) console.log("listRecords: ".red + err, err.stack); // an error occurred
                        else {
                              console.log("listRecords: " + JSON.stringify(data));
                              COGNITO_SYNC_TOKEN = data.SyncSessionToken;
                              COGNITO_SYNC_COUNT = data.DatasetSyncCount;
                              console.log('id', COGNITO_IDENTITY_ID);
                              addRecord();
                            }
                      }
                    );

                  }
                });

                  req.session.name = req.body.username;


                  if(req.body.username == 'ert32')
                  {
                    req.session.boss = req.body.username;
                    
                    P(token).then(function(token){
                      req.session.member = token;
                      res.render('index', {
                        member : req.session.member,
                        boss: req.session.boss,
                        name: req.session.name
                      });
                    });
                  }
                  else
                  {
                    console.log('enter');
                    P(token).then(function(token){
                      req.session.member = token;
                      res.render('index', {
                        member : req.session.member,
                        name: req.session.name
                      });
                    });
                  }

              });

          },

          onFailure: function(err) {
              console.error(err);
              console.log(typeof err);
              res.render('register', {
                error : err
              });
          }

      });

});


/*router.post('/', function(req, res, next){


        var authenticationData = {
            Username: req.body.username,
            Password: req.body.password
        };

        var userPool = new UserPool(poolData);
        var authenticationDetails = new AuDe(authenticationData);

        var userData = {
            Username: req.body.username,
            Pool: userPool
        };

        var cognitoUser = new User(userData);

        cognitoUser.authenticateUser(authenticationDetails, {

                onSuccess: function(result) {
                    token = result.getAccessToken().getJwtToken();
                    //console.log('access token + ' + token);
                    req.session.member = token;
                    res.render('index', {
                      member : token
                    });
                  },

                onFailure: function(err) {
                    console.error(err);
                    console.log(typeof err);
                    res.render('register', {
                      error : err
                    });
                }
            });

});*/



function addRecord(){
  var dt = dateTime.create();
  var formatted = dt.format('Y-m-d H:M:S');

  var params = {
    DatasetName: COGNITO_DATASET_NAME, // required
    IdentityId: COGNITO_IDENTITY_ID, // required
    IdentityPoolId: COGNITO_IDENTITY_POOL_ID, // required
    SyncSessionToken: COGNITO_SYNC_TOKEN, // required
    RecordPatches: [
      {
        Key: 'USER_ID', // required
        Op: 'replace', // required
        SyncCount: COGNITO_SYNC_COUNT, // required
        Value: formatted
         // required
        //DeviceLastModifiedDate: new Date(),

      }
    ]
  };

  cognitosync.updateRecords(params, function(err, data) {
    if (err) console.log("updateRecords: ".red + err, err.stack); // an error occurred
    else{
      console.log("Value: ".green + JSON.stringify(data));           // successful response
    }
  });
  COGNITO_SYNC_TOKEN = null;
  COGNITO_SYNC_COUNT = null;
  COGNITO_IDENTITY_ID = null;
}

module.exports = router;
