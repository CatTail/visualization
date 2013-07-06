var chart = new Chart();
d3.json('assets/data/chart.json', function (err, data) {
  chart.render(data);
});
//var socket = io.connect('http://localhost:8090');
//socket.on('chart', function (data) {
//});
//socket.on('graph', function (data) {
  //chart.update(data);
//});
