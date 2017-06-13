var RDS = require('../service/RDS');
var express = require('express');
var router = express.Router();
var async = require('async');
var Member = require('../models/Member');
var SQS = require('../service/SQS');


router.get('/', function(req, res) {
  res.render('forget');

});

router.post('/', function(req, res, err){

  email = req.body.email;
  console.log('Client forget email: ', email);
  SQS.send(email);

  var selection = 'SELECT * ' +'FROM Account3 ' + 'WHERE Email = '+ email;
  res.redirect('/register');

});
module.exports = router;
