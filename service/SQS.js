var aws      = require('aws-sdk');

var receipt  = "";
var queueUrl = "********";
/*AWS SQS*/
aws.config.update({region:'us-east-1'});

var sqs = new aws.SQS();

var SQS = function () {};

SQS.create = function(){

  var params = {
      QueueName: "MyFirstQueue"
  };

  sqs.createQueue(params, function(err, data) {
        if(err) {
            console.log('error', err);
        }
        else {
            console.log('success');

        }
    });

};


SQS.list = function(){


  sqs.listQueues(function(err, data) {
      if(err) {
        console.log('error', err);
        //res.send(err);
      }
      else {
        console.log('success');
        //res.send(data);
      }
  });


};

SQS.send  = function(message, queueUrlink){

  var set_params = {
      MessageBody: message,
      QueueUrl: queueUrlink,
      DelaySeconds: 0
  };

  sqs.sendMessage(set_params, function(err, data) {
      if(err) {
        console.log('SQS send error', err)
        //res.send(err);
      }
      else {
        console.log('Success Send SQS')
        //res.send(data);
      }
  });

};

SQS.receive = function (time, cb) {

    var params = {
        QueueUrl: "*************",
        MaxNumberOfMessages: 1,  // how many messages do we wanna retrieve?
        VisibilityTimeout: 30, // seconds - how long we want a lock on this job
        WaitTimeSeconds: time // seconds - how long should we wait for a message?

    };

    sqs.receiveMessage(params, function(err, data) {
        if(err) {
          console.log('error', err)
          //res.send(err);
          cb(err, null);
        }
        else {
          var message = data.Messages[0];
          var body = message.Body;
          console.log('re', body, typeof body);


          var deleteParams = {
            QueueUrl:  "******",
            ReceiptHandle: data.Messages[0].ReceiptHandle
          };
          sqs.deleteMessage(deleteParams, function(err, data) {
            if (err) {
              console.log("Delete Error", err);
            } else {
              console.log("Message Deleted", data);
            }
          });

          cb(null, '*******');
        }
    });
};

SQS.delete = function(){

  console.log('re_delte', receipt);

  var params = {
      MaxNumberOfMessages: 1,
      QueueUrl: queueUrl,
      ReceiptHandle: receipt
  };

  sqs.deleteMessage(params, function(err, data) {
      if(err) {
        console.log('error', err)
        //res.send(err);
      }
      else {
        console.log('success')
        //res.send(data);
      }
  });

};


SQS.purge = function(){

  var params = {
      QueueUrl: queueUrl
  };

  sqs.purgeQueue(params, function(err, data) {
      if(err) {
        console.log('error', err)
        //res.send(err);
      }
      else {
        console.log('success')
        //res.send(data);
      }
  });

};



module.exports = SQS;
