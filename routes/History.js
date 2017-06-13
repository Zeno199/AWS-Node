var express = require('express');
var router = express.Router();
var RDS = require('../service/RDS');
var Promise = require('promise');
//var User =  require('amazon-cognito-identity-js/lib/CognitoUser');


router.get('/', function(req, res, next) {

    /*var userData = {
        Username : req.body.username,
        Pool : userPool
    };
    var user = new User();
    user.getUserAttributes(function(err, result) {
      if (err) {
          alert(err);
          return;
      }
      for (i = 0; i < result.length; i++) {
          console.log('attribute ' + result[i].getName() + ' has value ' + result[i].getValue());
      }
  });*/
//Sat Jun 10 2017 02:39:25 GMT+0800 (CST)

  if(!req.session.member)
  {
    res.redirect('/');
  }
  else
  {
      if(req.session.boss)
      {
        res.render('history', {
             member : req.session.member,
             boss: req.session.boss,
             name: req.session.name
          });
      }
      else
      {
        res.render('history', { member : req.session.member,  name: req.session.name});
      }
  }
});


router.post('/', function(req, res){

  var begin = req.body.begin;
  var end = req.body.end;
  //var begin_time = req.body.time1;
  //var end_time = req.body.time2;

  console.log('this is', begin);
  console.log(end);

  /*if(req.session.boss)
  {
  }*/
  if(req.session.boss)
  {
    var instruction = 'SELECT * FROM TrashClean WHERE Time BETWEEN TIMESTAMP (' +  "'"+begin+' '+'00:00:00' +"')" + 'AND TIMESTAMP'+"('"+end+' 23:59:59'+"')" ;
  }
  else
  {
    var instruction = 'SELECT * FROM TrashClean WHERE Eid = '+ "'"+req.session.name +"'" +' AND Time BETWEEN TIMESTAMP (' +  "'"+begin+' '+'00:00:00' +"')" + 'AND TIMESTAMP'+"('"+end+' 23:59:59'+"')" ;
  }

  //var instruction = 'SELECT * FROM TrashClean WHERE Time BETWEEN TIMESTAMP (' +  "'"+begin+' '+begin_time +"')" + 'AND TIMESTAMP'+"('"+end+' '+end_time+"')" ;


  //var instruction = 'SELECT * FROM TrashClean WHERE Employee ='+"'"+req.session.name+"'"+'AND Time BETWEEN TIMESTAMP (' +  "'"+begin+' '+begin_time+"')" + 'AND TIMESTAMP'+"('"+end+' '+end_time+"')" ;
  //console.log(instruction);


  if(!req.session.member) {
    res.redirect('/');
  }
  else
  {
      RDS.lookup(instruction, function(err, result){

            itemsProcessed = 0;
            if(err){

                  if(req.session.boss)
                  {
                    res.render('history', {
                        member : req.session.member,
                        boss: req.session.boss,
                        name: req.session.name,
                        err: 'invalid' });
                  }
                  else
                  {
                    res.render('history', { member : req.session.member,  name: req.session.name , err: 'invalid' });
                  }
            }

            else {

                      if(req.session.boss)
                      {
                        res.render('history', {
                            member : req.session.member,
                            boss: req.session.boss,
                            name: req.session.name,
                            trash_info: result });
                      }
                      else
                      {
                        console.log(result);
                        res.render('history', { member : req.session.member,  name: req.session.name , trash_info: result});
                      }

          }
      });
  }

});


module.exports = router;
