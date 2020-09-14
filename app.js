var createError = require('http-errors');
var express = require('express');
var app = express();
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var port = 3001;

var indexRouter = require('./routes/index');

var deviceModule = require('./device')
var cmdLineProcess = require('./lib/cmdline');

var device = {};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.get('/start', function (req, res) {
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile start',
    timeInSeconds: 120
  }));
  res.end();
});

app.get('/reset', function (req, res) {
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile reset'
  }));
  res.end();
});

app.get('/stop', function (req, res) {
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile stop'
  }));
  res.end();
});

app.get('/addPlayerOnePoint', function (req, res) {
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile add p1 point'
  }));
  res.end();
});

app.get('/addPlayerTwoPoint', function (req, res) {
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile add p2 point'
  }));
  res.end();
});

app.get('/player-one-name', async function (req, res) {
  let playerOneName = req.query.name;
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile add p1 name',
    playerOneName
  }));
  res.end();
});

app.get('/player-two-name', async function (req, res) {
  let playerTwoName = req.query.name;
  device.publish('topic_2', JSON.stringify({
    directive: 'mobile add p2 name',
    playerTwoName
  }));
  res.end();
});

function processTest(args) {
  device = deviceModule({
    keyPath: args.privateKey,
    certPath: args.clientCert,
    caPath: args.caCert,
    clientId: args.clientId,
    region: args.region,
    baseReconnectTimeMs: args.baseReconnectTimeMs,
    keepalive: args.keepAlive,
    protocol: args.Protocol,
    port: args.Port,
    host: args.Host,
    debug: args.Debug
  });
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

cmdLineProcess('connect to the AWS IoT service and publish/subscribe to topics using MQTT, test modes 1-2', ["-k", "certs/private.pem.key", "-c", "certs/certificate.pem.crt", "-a", "certs/root-CA.crt", "-T", "smooth-boy", "-p", 8883, "-H", "avqchaav0iwou-ats.iot.us-east-2.amazonaws.com"], processTest);

app.listen(port, () => {
  console.log('Running on port ' + port)
})

module.exports = app;