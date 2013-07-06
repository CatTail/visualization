function Chart () {
  this.margin = {top: 20, right: 20, bottom: 30, left: 40};
  this.width = 960;// + this.margin.left + this.margin.right;
  this.height = 500;// + this.margin.top + this.margin.bottom;

  var chart = d3.select('body').append('svg')
    .attr('class', 'chart')
    .attr('width', this.width+this.margin.left+this.margin.right)
    .attr('height', this.height+this.margin.top+this.margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

  this.color = d3.scale.category20();

  this.x = d3.time.scale()
    .range([0, this.width]);
    //.rangeRoundBands([0, this.width], .1);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  this.container = d3.select('svg');
  this.chart = d3.select('svg.chart g');

  this.graph = new Graph(this.width, this.height);
}

Chart.prototype.render = function (data) {
  var _this = this;
  data.forEach(function(d) {
    d.frequency = +d.frequency;
    d.date = d3.time.format('%Y-%m-%d').parse(d.date);
  });

  //_this.x.domain(data.map(function(d) { return d.twitter; }));
  _this.x.domain(d3.extent(data, function(d){ return d.date; }));
  _this.y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

  _this.container.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+_this.margin.left+',' + (_this.height+this.margin.top) + ')')
    .call(_this.xAxis);

  _this.chart.selectAll('.bar')
    .data(data)
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) { return _this.x(d.date); })
    .attr('width', 3)
    .attr('y', function(d) { return _this.y(d.frequency); })
    .attr('height', function(d) { return _this.height - _this.y(d.frequency); });

  _this.chart.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 4)
    .attr('cx', function(d) { return _this.x(d.date) + 1.5; })
    .attr('cy', function(d) { return _this.y(d.frequency); })
    .style('fill', function(d) { return _this.color(1); });

  this.chart.selectAll('.dot').on('click', function () {
    var centre = {x: this.getAttribute('cx'), y: this.getAttribute('cy')};
    _this.renderGraph(centre);
  });
};

Chart.prototype.clear = function () {
  this.chart.selectAll('.dot, .bar').remove();
};

Chart.prototype.renderGraph = function (centre) {
  var _this = this;
  // polling
  d3.json('assets/data/graph.json', function (err, data) {
    _this.graph.update(data, centre);
  });
};
