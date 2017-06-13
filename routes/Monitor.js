// not update

var express = require('express');
var RDS = require('../service/RDS');
var SQS = require('../service/SQS');
var Map = require('../models/Location');
var Promise = require('promise');

var router = express.Router();

var instruction = 'SELECT * FROM Trashinfo WHERE ID in (SELECT max(ID) FROM Trashinfo GROUP BY Trashid ) order by ID desc';



// http://stackoverflow.com/questions/18983138/callback-after-all-asynchronous-foreach-callbacks-are-completed



/*function asyncFunction (item, cb) {

  if(item.Amount >= 50) // 50%
  {
    var geo = Map.geocode(item.Location, function(err, res) {
    console.log('excute: Location js');
    cb({lat: res[0]['latitude'], lng: res[0]['longitude']})
    });

  }
  else
  {
    cb(null);
  }
}*/


function asyncFunction (item, cb) {

  if(item.Amount >= 45) // 50%
  {
    cb({lat: item.Lat_trash, lng: item.Lng_trash})
  }
  else
  {
    cb(null);
  }
}

router.get('/', function(req, res) {

      if(!req.session.member) {
        res.redirect('/');
      }
      else{

        console.log('enter');
        RDS.lookup(instruction, function(err, result){

              itemsProcessed = 0;
              if(err){
                if(req.session.boss)
                {
                  res.render('monitor', {
                      member : req.session.member,
                      boss: req.session.boss,
                      name: req.session.name,
                      err: 'No place' });
                }
                else
                {
                  res.render('monitor', { member : req.session.member,  name: req.session.name , err: 'No place' });
                }
              }

              else {
                var location_list= [];
                /*location_list.push({lat: 25.024, lng: 121.57});
                location_list.push({lat: 25.024, lng: 121.57});*/

                result.forEach((item, index, array) => {
                asyncFunction(item, cb => {
                  if(cb)
                    location_list.push(cb)
                  itemsProcessed++;
                  if(itemsProcessed === array.length) {
                    //console.log('this is', result);
                    res.render('monitor', {
                         member : req.session.member,
                         trash_info: result,
                         google_location: JSON.stringify(location_list)
                      });
                  }
                });
              });

              }
        });
      }
  }
);

router.post('/', function(req, res){
  var message = req.body.meassage;

  if(!req.session.member) {
    res.redirect('/');
  }

  else{

          var instruction = 'SELECT * FROM Trashinfo WHERE Place = '+"'"+req.body.meassage +"'"+ ' AND ID in (SELECT max(ID) FROM Trashinfo GROUP BY Trashid ) order by ID desc';

          RDS.lookup(instruction, function(err, result){

                itemsProcessed = 0;
                if(err){
                      console.log('err'+err);
                      if(req.session.boss)
                      {
                        res.render('monitor', {
                            member : req.session.member,
                            boss: req.session.boss,
                            name: req.session.name,
                            err: 'No place' });
                      }
                      else
                      {
                        res.render('monitor', { member : req.session.member,  name: req.session.name , err: 'No place' });
                      }
                }

                else {
                  var location_list= [];
                  //console.log('i suucess but..', result);
                  if (result.length == 0)
                  {
                    console.log('result', result);
                    if(req.session.boss)
                    {
                      res.render('monitor', {
                          member : req.session.member,
                          boss: req.session.boss,
                          name: req.session.name,
                          err: 'No place' });
                    }
                    else
                    {
                      res.render('monitor', { member : req.session.member,  name: req.session.name , err: 'No place' });
                    }

                  }
                  /*location_list.push({lat: 25.024, lng: 121.57});
                  location_list.push({lat: 25.024, lng: 121.57});*/

                  result.forEach((item, index, array) => {
                  asyncFunction(item, cb => {
                    if(cb)
                      location_list.push(cb)
                    itemsProcessed++;
                    if(itemsProcessed === array.length) {
                      console.log(location_list);
                      res.render('monitor', {
                           member : req.session.member,
                           trash_info: result,
                           google_location: JSON.stringify(location_list)
                        });
                    }
                  });
                });

                }
          });

  }
})

module.exports = router;
