//var User =  require('amazon-cognito-identity-js/lib/CognitoUser');
var express = require('express');
var router = express.Router();



router.get('/', function(req, res, next) {
  console.log('user logout');

  req.session.destroy(function () {
        res.redirect('/');
    });
});


module.exports = router;
