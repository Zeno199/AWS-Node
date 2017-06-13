var express = require('express');
var router = express.Router();
var RDS = require('../service/RDS');
var Promise = require('promise');

// position 

router.get('/', function(req, res, next) {


  if(!req.session.member)
  {
    res.redirect('/');
  }
  else
  {
      if(req.session.boss)
      {
        res.render('pos', {
             member : req.session.member,
             boss: req.session.boss,
             name: req.session.name
          });
      }
      else
      {
        //console.log(req.session.name);
        res.render('pos', { member : req.session.member,  name: req.session.name});
      }
  }
});


router.post('/', function(req, res){


  //var instruction = 'SELECT * FROM Trashinfo where ID in (SELECT max(ID) FROM Trashinfo GROUP BY Trashid ) order by ID desc';

  if(!req.session.member) {
    res.redirect('/');
  }

  else{

      var trashid = req.body.ids;
      var membername = req.session.name;
      console.log('id'+ trashid);
      console.log('name', membername);

      //setTimeout(30000);  // wait to proecsss data become 0
      var instruction = 'SELECT * FROM Trashinfo WHERE Trashid =' + "'" +trashid +"'" + 'AND ID in (SELECT max(ID) FROM Trashinfo GROUP BY Trashid )';
      //' '


      //var place = '南港火車站';
      var waitTill = new Date(new Date().getTime() + 2 * 1000);
      console.log(waitTill);
      while( new Date() <=waitTill){ // final will be equal
       //new Date();
      if(waitTill <=new Date()) // when equal  or bigger go to , but new Date may bigger first , when proces more than 1
      {

      //var success = 1;
      RDS.lookup(instruction, function(err, result){

        if(err){

                //console.log('frst insert error', err);
                if(req.session.boss)
                {
                  res.render('pos', {
                      member : req.session.member,
                      boss: req.session.boss,
                      name: req.session.name,
                      output: 'lookup error, faied to update' });
                }
                else
                {
                  res.render('pos', { member : req.session.member,  name: req.session.name , output: 'lookup error, faied to update'});
                }
        }

        else
        {
              if(result.length > 0)
              {
                if(result[0].Amount == 0)
                {
                  console.log('myfind Amount'+ result[0].Amount);
                  console.log('suceess to find 0');
                  var insert = 'INSERT INTO TrashClean (Trashid, Eid, Lng_user, Lat_user) VALUES' + '('+trashid+',' + "'"+membername+"', "+"'"+result[0].Lng_trash+"' , "+"'"+ result[0].Lat_trash +"' "+')';
                  RDS.lookup(insert, function(err, result){

                      if(err)
                      {
                          console.log('2insert error', err);
                          if(req.session.boss)
                          {
                            res.render('pos', {
                                member : req.session.member,
                                boss: req.session.boss,
                                name: req.session.name,
                                output: 'Wait a few of  time, try agian' });
                          }
                          else
                          {
                            res.render('pos', { member : req.session.member,  name: req.session.name , output: 'Wait a few of  time, try agian'});
                          }
                        }
                        else // success to update infor give  result list
                        {
                            var  find_newinsert = 'SELECT * FROM TrashClean WHERE Eid = '+"'"+req.session.name+"'"+' AND Trashid = '+"'"+trashid +"'"+' AND ID in (SELECT max(ID) FROM TrashClean GROUP BY Trashid )' ;
                            RDS.lookup(find_newinsert, function(err, result){

                              if(err)
                              {
                                  if(req.session.boss)
                                  {
                                    res.render('pos', {
                                        member : req.session.member,
                                        boss: req.session.boss,
                                        name: req.session.name,
                                        output: 'lookup error, success to update' });
                                  }
                                  else
                                  {
                                    res.render('pos', { member : req.session.member,  name: req.session.name , output: 'lookup error, success to update'});
                                  }
                              }
                              else
                              {
                                console.log(result); // suceess to give result
                                if(req.session.boss)
                                {
                                  res.render('pos', {
                                      member : req.session.member,
                                      boss: req.session.boss,
                                      name: req.session.name,
                                      update_result : result,
                                      output: 'Success to update'});
                                }
                                else
                                {
                                  res.render('pos', { member : req.session.member,  name: req.session.name , update_result : result, output: 'Success to update'});
                                }
                              }


                            });
                        }
                  });

                }
                else
                {
                    if(req.session.boss)
                    {
                      res.render('pos', {
                          member : req.session.member,
                          boss: req.session.boss,
                          name: req.session.name,
                          output: 'Amount >0'});
                    }
                    else
                    {
                      res.render('pos', { member : req.session.member,  name: req.session.name , output: 'Amount >0'});
                    }
                }
              }
              else {
                if(req.session.boss)
                {
                  res.render('pos', {
                      member : req.session.member,
                      boss: req.session.boss,
                      name: req.session.name,
                      output: 'Trashcan ID Not Exist'});
                }
                else
                {
                  res.render('pos', { member : req.session.member,  name: req.session.name , output: 'Trashcan ID Not Exist'});
                }
              }
       } });
        break;
     }

   };
      /*if(waitTill <new Date())
      {

      //var success = 1;
      RDS.lookup(instruction, function(err, result){

        if(err){

                //console.log('frst insert error', err);
                if(req.session.boss)
                {
                  res.render('pos', {
                      member : req.session.member,
                      boss: req.session.boss,
                      name: req.session.name,
                      output: 'lookup error, faied to update' });
                }
                else
                {
                  res.render('pos', { member : req.session.member,  name: req.session.name , output: 'lookup error, faied to update'});
                }
        }

        else
        {
                console.log('myfind Amount'+ result[0].Amount);
                if(result[0].Amount == 0)
                {

                  console.log('suceess to find 0');
                  var insert = 'INSERT INTO TrashClean (Trashid, Eid, Lng_user, Lat_user) VALUES' + '('+trashid+',' + "'"+membername+"', "+"'"+result[0].Lng_trash+"' , "+"'"+ result[0].Lat_trash +"' "+')';
                  RDS.lookup(insert, function(err, result){

                      if(err)
                      {
                          console.log('2insert error', err);
                          if(req.session.boss)
                          {
                            res.render('pos', {
                                member : req.session.member,
                                boss: req.session.boss,
                                name: req.session.name,
                                output: 'Wait a few of  time, try agian' });
                          }
                          else
                          {
                            res.render('pos', { member : req.session.member,  name: req.session.name , output: 'Wait a few of  time, try agian'});
                          }
                        }
                        else // success to update infor give  result list
                        {
                            var  find_newinsert = 'SELECT * FROM TrashClean WHERE Eid = '+"'"+req.session.name+"'"+' AND Trashid = '+"'"+trashid +"'"+' AND ID in (SELECT max(ID) FROM TrashClean GROUP BY Trashid )' ;
                            RDS.lookup(find_newinsert, function(err, result){

                              if(err)
                              {
                                  if(req.session.boss)
                                  {
                                    res.render('pos', {
                                        member : req.session.member,
                                        boss: req.session.boss,
                                        name: req.session.name,
                                        output: 'lookup error, success to update' });
                                  }
                                  else
                                  {
                                    res.render('pos', { member : req.session.member,  name: req.session.name , output: 'lookup error, success to update'});
                                  }
                              }
                              else
                              {
                                console.log(result); // suceess to give result
                                if(req.session.boss)
                                {
                                  res.render('pos', {
                                      member : req.session.member,
                                      boss: req.session.boss,
                                      name: req.session.name,
                                      update_result : result,
                                      output: 'Success to update'});
                                }
                                else
                                {
                                  res.render('pos', { member : req.session.member,  name: req.session.name , update_result : result, output: 'Success to update'});
                                }
                              }


                            });
                        }
                  });

                }
                else
                {
                    if(req.session.boss)
                    {
                      res.render('pos', {
                          member : req.session.member,
                          boss: req.session.boss,
                          name: req.session.name,
                          output: 'Amount >0'});
                    }
                    else
                    {
                      res.render('pos', { member : req.session.member,  name: req.session.name , output: 'Amount >0'});
                    }
                }
       } });

     }*/
}
});


module.exports = router;
