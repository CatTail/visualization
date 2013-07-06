function Chart () {
  this.margin = {top: 20, right: 20, bottom: 30, left: 40};
  this.width = 960;// + this.margin.left + this.margin.right;
  this.height = 500;// + this.margin.top + this.margin.bottom;

  var chart = d3.select('body').append('svg')
    .attr('width', this.width+this.margin.left+this.margin.right)
    .attr('height', this.height+this.margin.top+this.margin.bottom)
    .append('g')
    .attr('class', 'chart')
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
  this.chart = d3.select('svg .chart');

  this.graph = new Graph(this.width, this.height);
}

Chart.prototype.render = function (data) {
  var _this = this;
  data.forEach(function(d) {
    d.weight = +d.weight;
    d.date = d3.time.format('%Y-%m-%d %H:%M').parse(d.date);
  });

  //_this.x.domain(data.map(function(d) { return d.twitter; }));
  _this.x.domain(d3.extent(data, function(d){ return d.date; }));
  _this.y.domain([0, d3.max(data, function(d) { return d.weight; })]);

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
    .attr('y', function(d) { return _this.y(d.weight); })
    .attr('height', function(d) { return _this.height - _this.y(d.weight); });

  _this.chart.selectAll('.dot')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 10)
    .attr('cx', function(d) { return _this.x(d.date) + 1.5; })
    .attr('cy', function(d) { return _this.y(d.weight); })
    .style('fill', function(d) { return _this.color(1); })
    .attr('data-mid', function (d) { return d.mid;});

  this.chart.selectAll('.dot').on('click', function () {
    var mid = this.getAttribute('data-mid');
    var centre = {x: this.getAttribute('cx'), y: this.getAttribute('cy')};
    $.when($('.dot, .bar, .axis').hide('slow')).done(function() {
      _this.renderGraph(mid, centre);
    });
  });
};

Chart.prototype.clear = function () {
  this.chart.selectAll('.dot, .bar').remove();
};

Chart.prototype.renderGraph = function (mid, centre) {
  var _this = this;
  var root = {name: mid, mid: mid, uid: uid, group:0, uuid: uuid()};
  var tree = {
    nodes:[root],
    links:[]
  };
  var stack = [root], level = 1;
  async.eachSeries(stack, function (node, callback) {
    //stack = stack.slice(1);
    _this._renderGraph(node, centre, level, stack, tree, function () {
      level++;
      callback && callback();
    });
  });
//  _this.graph.update(json, centre);
};

Chart.prototype._renderGraph = function (parent, centre, level,
                                         stack, tree, callback) {
  var _this = this;
  socket.emit('micro', {uid: parent.uid, mid: parent.mid});
  socket.on('micro', function (data) {
    async.eachSeries(data.forwards.slice(0, 10), function (json, callback) {
      var node = {name: json.nickname, mid: json.mid, uid: json.uid, group: level, uuid: uuid()};
      //stack.push(node);
      console.log(stack);
      tree.nodes.push(node);
      tree.links.push({source: parent.uuid, target: node.uuid, value: 1});
      _this.graph.clear();
      _this.graph.render(tree, centre);
      setTimeout(callback, 1000);
    }, function () {
      callback && callback();
    });
  });
};
