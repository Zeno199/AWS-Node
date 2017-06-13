var AWS = require('aws-sdk'),
fs = require('fs');


var S3 = new AWS.S3();
console.log(process.argv);
var myArgs = process.argv.slice(2);



S3.upload = function(filename, fileBinary, cb){

  var params =
  { Bucket: '**********',
    Key: filename,
    Body: fileBinary,
    ACL: 'public-read'
  };

  S3.putObject(params, function(error,res){

        if(error)cb(error,null);
        else cb(null,filename);
    });

/*fs.readFile(file, function (err, data) {
  console.log(file);
  if (err) { throw err; }

  var base64data = new Buffer(data, 'binary');*/

};




/*S3.upload = function(file){

fs.readFile(file, function (err, data) {
  console.log(file);
  if (err) { throw err; }

  var base64data = new Buffer(data, 'binary');

  S3.putObject({
    Bucket: '*******',
    Key: file,
    Body: base64data,
    ACL: 'public-read'
  },function (resp) {
    console.log(arguments);
    console.log('Successfully uploaded package.');
  });

});/

};*/


S3.downlad = function(file){
    var fileKey = file;

    console.log('Trying to download file', fileKey);

    var options = {
        Bucket    : '**********',
        Key    : fileKey,
    };

    //res.attachment(fileKey);
    var fileStream = S3.getObject(options).createReadStream();
    //fileStream.pipe(res);
};
// http://stackoverflow.com/questions/22143628/nodejs-how-do-i-download-a-file-to-disk-from-an-aws-s3-bucket


module.exports = S3


/*
http://stackoverflow.com/questions/30741262/s3-direct-bucket-upload-success-but-file-not-there

*/
