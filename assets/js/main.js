var socket = io.connect('http://localhost:8090');
var chart = new Chart(socket);
socket.on('chart', function (data) {
  chart.render(data);
});
socket.on('graph', function (data) {
  chart.update(data);
});
