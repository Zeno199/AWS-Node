var express = require('express');
var router = express.Router();
var async = require('async');
var Promise = require('promise');


var UserPool =  require('amazon-cognito-identity-js/lib/CognitoUserPool.js');
var UserAtt =  require('amazon-cognito-identity-js/lib/CognitoUserAttribute');
var User =  require('amazon-cognito-identity-js/lib/CognitoUser');
var AuDe = require('amazon-cognito-identity-js/lib/AuthenticationDetails');
var AWS = require('aws-sdk');

// new 6.2
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var colors = require('colors');

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
var COGNITO_IDENTITY_ID, COGNITO_SYNC_TOKEN, AWS_TEMP_CREDENTIALS;
var cognitosync;
var IAM_ROLE_ARN =  '';
var COGNITO_SYNC_COUNT;
var COGNITO_DATASET_NAME = 'TEST_DATASET';

// test app
var FACEBOOK_APP_ID =  ''; // us-east-1_JAKw1kFqv , pool
var FACEBOOK_APP_SECRET =  ''; // 2q9jv7nhggcun2gotf6nuhas3s, app client
var FACEBOOK_TOKEN;
var AWS_TOKEN;
var FACEBOOK_USER = {
  id: '',
  first_name: '',
  gender: '',
  last_name: '',
  link: '',
  locale: '',
  name: '',
  timezone: 0,
  updated_time: '',
  verified: false
};
var userLoggedIn = false;


passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL:''
  // link may be change 3000 ,callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function(accessToken, refreshToken, profile, done) {
  process.nextTick(function() {
    FACEBOOK_TOKEN = accessToken;
    FACEBOOK_USER = profile._json;
    userLoggedIn = true;
    done(null, profile);
  });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


/* GET Facebook page. */
//router.get('/', passport.authenticate('facebook'));

/* GET Facebook callback page. */





router.get('/', passport.authenticate('facebook'));


/*router.get('/callback', passport.authenticate('facebook'),
          function(req, res){
            console.log('FACEBOOK_TOKEN:'.green + FACEBOOK_TOKEN);
            req.session.member = FACEBOOK_TOKEN;
            res.render('index', {
            member : FACEBOOK_TOKEN
            });

          });*/
router.get('/callback',passport.authenticate('facebook', {
  successRedirect: '/auth/facebook/success',
  failureRedirect: '/auth/facebook/error'
}));



/*
* GET Facebook callback page. */
/*router.get('/callback', function(req,res, next){

  console.log('FACEBOOK_TOKEN:'.green + FACEBOOK_TOKEN);
  req.session.member = FACEBOOK_TOKEN;
  res.render('index', {
  member : '22'
  });

  /*passport.authenticate('facebook', {
    successRedirect: '/auth/facebooksuccess',
    failureRedirect: '/auth/facebook/error',
  });*/
//});




router.get('/success', function(req, res, next) {

  console.log('FACEBOOK_TOKEN:'.green + FACEBOOK_TOKEN);
  req.session.member = FACEBOOK_TOKEN;



  P(FACEBOOK_TOKEN).then(function(FACEBOOK_TOKEN){
    // The parameters required to intialize the Cognito Credentials object.
    var params = {
      AccountId: AWS_ACCOUNT_ID, // required
      RoleArn: IAM_ROLE_ARN,  // required
      IdentityPoolId: COGNITO_IDENTITY_POOL_ID, // required
      Logins: {
        'graph.facebook.com': FACEBOOK_TOKEN
      }
    };
    // user ppol

    // set the Amazon Cognito region
    AWS.config.region = AWS_REGION;
      // initialize the Credentials object with our parameters
    AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

    // We can set the get method of the Credentials object to retrieve
    // the unique identifier for the end user (identityId) once the provider
    // has refreshed itself

    P(AWS_REGION).then(function(){

        AWS.config.credentials.get(function(err) {

        if (err) console.log("credentials.get: ".red + err, err.stack); // an error occurred
        else{
            //AWS_TEMP_CREDENTIALS = AWS.config.credentials.data.Credentials;
          AWS_TEMP_CREDENTIALS = AWS.config.credentials;
          COGNITO_IDENTITY_ID = AWS.config.credentials.identityId;
          console.log("Cognito Identity Id: ".green + COGNITO_IDENTITY_ID);

          P(COGNITO_IDENTITY_ID).then(function(COGNITO_IDENTITY_ID){

            console.log('iddd' + COGNITO_IDENTITY_ID);
            cognitosync = new AWS.CognitoSync();

            cognitosync.listRecords({
              DatasetName: COGNITO_DATASET_NAME, // required
              IdentityId: COGNITO_IDENTITY_ID,  // required
              IdentityPoolId: COGNITO_IDENTITY_POOL_ID  // required  , to here
              // to here
            },function(err, data) {

              if (err) console.log("listRecords: ".red + err, err.stack); // an error occurred
              else {
                    console.log("listRecords: ".green + JSON.stringify(data));
                    token = data.SyncSessionToken;
                    COGNITO_SYNC_TOKEN = data.SyncSessionToken;
                    COGNITO_SYNC_COUNT = data.DatasetSyncCount;
                    //req.session.member = data.SyncSessionToken;

                    P(COGNITO_SYNC_TOKEN).then(function(token){
                      console.log("SyncSessionToken: ".green + COGNITO_SYNC_TOKEN);           // successful response
                      console.log("DatasetSyncCount: ".green + COGNITO_SYNC_COUNT);

                      req.session.member = FACEBOOK_TOKEN;
                      req.session.name = FACEBOOK_USER.name;
                      res.render('index.jade', {
                      member : req.session.member,
                      name : req.session.name
                      });
                      addRecord();
                    });

                    //FACEBOOK_USER.name
                    /*while(1)
                    {
                      if (COGNITO_SYNC_COUNT != null)
                      {
                          res.render('index', {
                          member : FACEBOOK_TOKEN
                          });

                          console.log("SyncSessionToken: ".green + COGNITO_SYNC_TOKEN);           // successful response
                          console.log("DatasetSyncCount: ".green + COGNITO_SYNC_COUNT);
                          addRecord();
                          break;
                      }
                    }*/

                  }

              });

            });
          }

        });
    });
  });

});





/*router.route('/sync')
  .put(function(req, res) {
    res.json({ message: 'Sync Put Started' });
  })
  .get(function(req, res) {

  });*/

/* GET Facebook error page. */
router.get('/error', function(req, res, next) {
  res.send("Unable to access Facebook servers. Please check internet connection or try again later.");
});


function addRecord(){
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
        //DeviceLastModifiedDate: new Date(),
        Value: FACEBOOK_USER.id
      }
    ]
  };
  console.log("UserID: ".cyan + FACEBOOK_USER.id);
  cognitosync.updateRecords(params, function(err, data) {
    if (err) console.log("updateRecords: ".red + err, err.stack); // an error occurred
    else{
      console.log("Value: ".green + JSON.stringify(data));           // successful response
    }
  });
}




module.exports = router;
