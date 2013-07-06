var chart = new Chart();
d3.json('assets/data/chart.json', function(error, data) {
  chart.render(data);
});
