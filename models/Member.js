

var Member = function(information){

   this.id = information.id;
   this.account = information.account;
   this.password = information.password;
   this.rank  = information.rank;
   this.email  = information.email;
};


module.exports = Member;
