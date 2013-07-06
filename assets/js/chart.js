function Chart () {
  var margin = {top: 20, right: 20, bottom: 30, left: 40};
  this.width = 960 + margin.left + margin.right;
  this.height = 500 + margin.top + margin.bottom;

  var chart = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', this.width)
    .attr('height', this.height)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  this.color = d3.scale.category20();

  this.x = d3.scale.ordinal()
    .rangeRoundBands([0, this.width], .1);
  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.chart = d3.select('svg.chart g');
}

Chart.prototype.render = function (data) {
  var _this = this;
  data.forEach(function(d) {
    d.frequency = +d.frequency;
  });

  _this.x.domain(data.map(function(d) { return d.twitter; }));
  _this.y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  _this.chart.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return _this.x(d.twitter); })
    .attr('width', 5)
    .attr('y', function(d) { return _this.y(d.frequency); })
    .attr('height', function(d) { return _this.height - _this.y(d.frequency); });

  _this.chart.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 10)
    .attr('cx', function(d) { return _this.x(d.twitter) + 2; })
    .attr('cy', function(d) { return _this.y(d.frequency); })
    .style('fill', function(d) { return _this.color(1); });

  var graph = new Graph(_this.width, _this.height);
  this.chart.selectAll('.dot').on('click', function () {
      var el = this;
      d3.json('assets/data/graph.json', function(error, data) {
        console.log('click');
        graph.clear();
        graph.render(data, 
                     {x: el.getAttribute('cx'), y: el.getAttribute('cy')});
      });
    });
};
