var renderChart = function () {
  var width = window.screen.availWidth
    , height = window.screen.availHeight
    , margin = {top: 20, right: 20, bottom: 30, left: 40};

  width = 960 + margin.left + margin.right;
  height = 500 + margin.top + margin.bottom;

  var chart = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var color = d3.scale.category20();

  var x = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

  var y = d3.scale.linear()
    .range([height, 0]);

  var svg = d3.select('svg.chart g');

  d3.json('assets/data/chart.json', function(error, data) {
    data.forEach(function(d) {
      d.frequency = +d.frequency;
    });

    x.domain(data.map(function(d) { return d.twitter; }));
    y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', function(d) { return x(d.twitter); })
      .attr('width', 5)
      .attr('y', function(d) { return y(d.frequency); })
      .attr('height', function(d) { return height - y(d.frequency); });

    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 10)
      .attr('cx', function(d) { return x(d.twitter) + 2; })
      .attr('cy', function(d) { return y(d.frequency); })
      .style('fill', function(d) { return color(1); });

    var graph = new Graph(width, height);
    svg.selectAll('.dot').on('click', function () {
        var el = this;
        d3.json('assets/data/graph.json', function(error, data) {
          console.log('click');
          graph.clear();
          graph.render(data, 
                       {x: el.getAttribute('cx'), y: el.getAttribute('cy')});
        });
      });
  });
};
