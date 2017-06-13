/* Insert trashcan data */

var RDS = require('../service/RDS');



var Data = function(information){

  this.id = information.id;
  this.TrashCan = information.TrashCan;
  this.Location = information.Location;
  this.Time  = information.Time;
  this.amount = information.amount;

};



Data.insert =  function(data1, data2 ,data3){

    //var selection = 'INSERT INTO ' +'Account2 '+ '(Account, Password, RANK) '+'VALUES '+'(' + "'"+ newMember.account +"'"+', '+ "'"+newMember.password+"'"+', '+ newMember.rank +')';
    var instruction = 'INSERT INTO ' +'Trash_practice2 '+ '(TrashCan, Location, Amount) '+'VALUES '+'(' + "'"+ data1 +"'"+', '+"'"+ data2 +"'" +', '+ "'"+data3 +"'"+')';

    RDS.lookup(instruction, function(err, show){

      if(err){
            console.log(err);
      }


    });

}



module.exports = Data;
