var fs = require('fs');
var app = require('express')();
var sockets = [];

app.listen(3000);
app.get('/api/at', function(req, res){
  console.log(req.query);
  sockets.forEach(function (socket) { socket.emit('at', req.query); });
  res.send('done!');
});

app.get('/api/tweet', function (req, res) {
  console.log(req.query);
  sockets.forEach(function (socket) { socket.emit('tweet', req.query); });
  res.send('done!');
});

app.get('/api/retweet', function (req, res) {
  console.log(req.query);
  sockets.forEach(function (socket) { socket.emit('retweet', req.query); });
  res.send('done!');
});

app.get('/api/XXX', function (req, res) {
  console.log(req.query);
  sockets.forEach(function (socket) { socket.emit('XXX', req.query); });
  res.send('done!');
});

require('socket.io').listen(8090).sockets.on('connection', function (socket) {
  sockets.push(socket);

  socket.emit('resume', JSON.parse(fs.readFileSync('assets/data/backup.json', 'utf8')));
  socket.on('backup', function (data) {
    fs.writeFileSync('assets/data/backup.json', JSON.stringify(data), 'utf8');
  });
});
