var RDS = require('../service/RDS');
var express = require('express');
var router = express.Router();
var async = require('async');
var Member = require('../models/Member');



router.post('/', function(req, res, next){


    var newMember = new Member({
      account : req.body.account,
      password : req.body.password,
      rank : 1,
      email: req.body.email
    });



    //var NewAccount = req.body.account;
    //var Password = req.body.password;
    /*var tokens = req.body.tokens;
    //if(tokens ==)
    //{
      var selection = 'INSERT INTO ' +'Account2 '+ '(Account, Password, RANK) '+'VALUES '+'(' + "'"+ newMember.account +"'"+', '+ "'"+newMember.password+"'"+', '+ newMember.rank +')';
      console.log('Create Instruction of Account: '+selection);
      RDS.lookup(selection);*/
      var selection = 'INSERT INTO ' +'Account3 '+ '(Account, Password, RANK, Email) '+'VALUES '+'(' + "'"+ newMember.account +"'"+', '+ "'"+newMember.password+"'"+', '+ newMember.rank +', '+ newMember.email +')';

      console.log(selection);
      RDS.lookup(selection, function(err, member){

        if (err){
              console.log(err);
              res.redirect('/register');
              next(err);
              //res.status(err.code);
              //res.json(err);
        }
        else{
          /* avoid repeat headers*/
          var selection = 'SELECT * ' +'FROM Account3 ' + 'WHERE Account = '+  newMember.account+' AND '  + 'Password = ' + newMember.password;

           RDS.lookup(selection, function(err, member){

               if(err) {
                     //res.status(err.code);
                     //res.json(err);
                     console.log(err);
                     res.redirect('/register');
                     next(err);
               }
               else {
                     newMember.id = member[0].id;
                     req.session.member = newMember;

                     if(req.session.member)
                     {
                       console.log('sess', req.session.member);
                       res.render('index', {
                         member : req.session.member
                       });

                     }
                     else {
                        res.redirect('/register');
                        next() ;
                     }
               }
           });

        }
      });


});


module.exports = router;
