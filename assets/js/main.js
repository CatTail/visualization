var socket = io.connect('http://localhost:8090');
var chart = new Chart();
var uid =  '3240119923';
socket.emit('user', {uid: uid});
socket.on('user', function (data) {
  chart.render(data);
});
