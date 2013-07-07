var fs = require('fs');
var io = require('socket.io').listen(8090);
var express = require('express');
var app = express();
var socket;
app.listen(3000);
app.get('/api/at', function(req, res){
  console.log(req.query);
  socket.emit('at', req.query);
  res.send('done!');
});

app.get('/api/tweet', function (req, res) {
  console.log(req.query);
  socket.emit('tweet', req.query);
  res.send('done!');
});

app.get('/api/retweet', function (req, res) {
  console.log(req.query);
  socket.emit('retweet', req.query);
  res.send('done!');
});

app.get('/api/XXX', function (req, res) {
  console.log(req.query);
  socket.emit('XXX', req.query);
  res.send('done!');
});

io.sockets.on('connection', function (s) {
  socket = s;
  s.emit('resume', JSON.parse(fs.readFileSync('assets/data/backup.json', 'utf8')));

  s.on('backup', function (data) {
    fs.writeFileSync('assets/data/backup.json', JSON.stringify(data), 'utf8');
  });
});

// at
// tweet
// retweet
// XXX
//
  //socket.on('user', function (data) {
    //http.get('http://192.168.1.140:8888/user?uid='+data.uid, function(res) {
      //console.log("Got response: " + res.statusCode);
      //res.setEncoding('utf8')
      //data = '';
      //res.on('data', function (d) {
        //data += d
      //});
      //res.on('end', function () {
        //socket.emit('user', JSON.parse(data));
      //});
    //}).on('error', function(e) {
      //console.log("Got error: " + e.message);
    //});
  //});

  //socket.on('micro', function (data) {
    //http.get('http://192.168.1.140:8888/weibo?uid='+data.uid+'&mid='+data.mid, function(res) {
      //console.log("Got response: " + res.statusCode);
      //res.setEncoding('utf8')
      //data = '';
      //res.on('data', function (d) {
        //data += d
      //});
      //res.on('end', function () {
        //socket.emit('micro', JSON.parse(data));
      //});
    //}).on('error', function(e) {
      //console.log("Got error: " + e.message);
    //});
  //});


