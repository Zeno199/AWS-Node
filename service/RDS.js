var mysql = require('mysql');
var async = require('async');

//var table_def =  'CREATE TABLE '+ 'Trash_practice1' + ' (id INT(100) NOT NULL AUTO_INCREMENT, TrashCan INT(200), Location  VARCHAR(50), Time  DATE, PRIMARY KEY(id))';

var table_def1 =  'CREATE TABLE '+ 'Trash_Record1' + ' (id INT(100) NOT NULL AUTO_INCREMENT, trashid INT(100), Employee NVARCHAR(50),Location  NVARCHAR(50), Amount  INT(4), Time  DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id))';

var table_def2 =  'CREATE TABLE '+ 'Trash_Status2' + ' (id INT(100) NOT NULL AUTO_INCREMENT, trashid INT(100), Location  NVARCHAR(50), Amount  INT(4), Time  DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(id))';

//var table_def3 = 'CREATE TABLE '+ 'S3Files1' + ' (id INT(100) NOT NULL AUTO_INCREMENT, Account  VARCHAR(20), Link VARCHAR(300), FileName VARCHAR(300),PRIMARY KEY(id))';
//var db_in = 'CREATE DATABASE' + ' Cloud'

//var table_def3 = 'INSERT INTO Trash_Status2 (trashid, Location, Amount) VALUES' + '(1,' + "'台北市政府'" + ', 60)';
//var table_def4 = 'INSERT INTO TrashClean (Trashid, Eid, Lat_user, Lng_user) VALUES' + '(0001,' + "'ewrt2',"+"'120.33557977',"  + "'25.33557977'"+')';

var table_def5 = 'INSERT INTO Trashinfo (Trashid, Place, Lng_trash, Lat_trash, Amount, Health) VALUES' + '(17,' + "'Taipei',"+"'121.40419586',"  + "'25.33557977',"+ String(0)+', TRUE)';




//Trashinfo(ID  INT(20) NOT NULL AUTO_INCREMENT,  Trashid INT(20), Place NVARCHAR(30), Lat_trash DECIMAL(10, 8) NOT NULL, Lng_trash DECIMAL(11, 8) NOT NULL, Amount INT(3), Health BOOLEAN,Time  TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(ID))")

var RDS = mysql.createConnection({
  host     : process.env.RDS_HOSTNAME || 'cloudprogfianl.cv8jlxn8nluc.us-east-1.rds.amazonaws.com',
  user     : process.env.RDS_USERNAME || 'trash',
  password : process.env.RDS_PASSWORD || 'trash123',
  port     : process.env.RDS_PORT || '3306',
  database : process.env.RDS_DB_NAME || 'Trash'
});

//RDS.connect();
/*RDS.query(table_def5, function(err, result){

                    // Case there is an error during the creation
                    if(err) {
                        console.log(err);
                    }
                    else{
                        console.log("Table Ter_Stops Created");
                    }
                });*/


RDS.con = function(){

  RDS.connect(function(err) {

   if (err) {
     console.error('Database connection failed: ' + err.stack);
     return;
   }
   else {

     console.log('Connected to database.');
   }

 })};


/*create table*/
RDS.table = function(){

  RDS.query(table_def, function(err, result){

    if (err){

        console.error('Database connection failed: ' + err);

    }
    else{

      console.log('Success');
    }

  });

};



RDS.lookup = function(instruct, callback){


  RDS.query(instruct, function(err, result){

    if (err){

        console.error('Database instruction failed: ' + err);
        callback(err, null);

    }
    else{

      console.log('Success to execute RDS');
      callback(null, result);

    };
  });


};




RDS.ending =  function(){

    RDS.end(function(){
      console.log('this end');
    });

};

module.exports = RDS;
