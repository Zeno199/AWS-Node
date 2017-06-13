var express = require('express');
var exfileup = require('express-fileupload');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require("express-session"); // for res.session
var redisStore = require('connect-redis')(session);
var passport = require('passport');
//var colors = require('colors');




var index = require('./routes/index');
var register = require('./routes/register');
var createAccount = require('./routes/Create_Account');
var login = require('./routes/Login');
var logout = require('./routes/Logout');
var monitor = require('./routes/Monitor');
var forgetPassword = require('./routes/forgetPassword');
//var fileup = require('./routes/FileUp.js');
var recog = require('./routes/ReCog');
var confirm = require('./routes/Confirm');
var logins = require('./routes/FBLogin');
var history = require('./routes/History');
var pos = require('./routes/Pos')

var RDS = require('./service/RDS');
var S3 = require('./service/S3');
var SQS = require('./service/SQS');

//RDS.con();
//RDS.table();
//RDS.ending();


//SQS.create();
//SQS.send();
//SQS.receive();

//SQS.delete();
//SQS.purge();


//S3.upload('./service/test.js');
var app = express();
app.listen(8081, 'localhost');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


app.use(passport.initialize());
//app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(exfileup());
app.use(cookieParser());

app.use(session({
  secret: 'recommand 128 bytes random string',
  cookie: { maxAge: 600 * 1000 },
  saveUninitialized: true,
  resave: true
}));

/*app.use(session({
  store: new redisStore(),
  secret: 'somesecrettoken'
}));*/

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/register', register);
app.use('/create_Account', createAccount);
app.use('/login', login);
app.use('/logout', logout);
app.use('/monitor', monitor);
app.use('/forget', forgetPassword);
//app.use('/fileup', fileup);
app.use('/recog', recog);
app.use('/confirm', confirm);
app.use('/auth/facebook', logins);
app.use('/history', history);
app.use('/pos', pos);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
