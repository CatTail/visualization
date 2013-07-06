function Graph (width, height) {
  this.width = width;
  this.height = height;
  this.container = d3.select('svg');
  this.color = d3.scale.category20();
  this.force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([this.width, this.height]);
};

Graph.prototype.render = function (data, centre) {
  var _this = this;
  _this.data = data;
  _this.centre = centre;
  var transform = "translate("+(centre.x-_this.width/2+40)+","+(centre.y-_this.height/2+17)+")";

  _this.force
    .nodes(data.nodes)
    .links(data.links)
    .start();

  _this.links = _this.container.selectAll('.link')
    .data(data.links)
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(d.value); });

  _this.nodes = _this.container.selectAll('.node')
    .data(data.nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr('r', 5)
    .style('fill', function(d) { return _this.color(d.group); })
    .call(_this.force.drag);

  _this.texts = _this.container.selectAll('text')
    .data(data.nodes)
    .enter()
    .append('text')
    .text(function (d) { return d.name; })
//    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px');
 //   .attr('fill', 'red');

  _this.nodes.append('title')
    .text(function(d) { return d.name; });

  _this.force.on('tick', function() {
    _this.links
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    _this.nodes
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });

    _this.texts
      .attr('x', function (d) { return d.x; })
      .attr('y', function (d) { return d.y; });

    _this.container.selectAll('.link, .node, text')
      .attr('transform', function () { return transform; });
  });

};

Graph.prototype.clear = function () {
  this.container.selectAll('.node, .link, text').remove();
};

Graph.prototype.update = function (data, centre) {
  var _this = this;
  this.render(data, centre);
  var index = 1;
  setInterval(function () {
    d3.json('http://localhost:8000/api/test.json', function (err, data) {
      // cross domain
      // data handler
      //console.log(data);
      //data.nodes.push({'name':'start','group':5});
      //data.links.push({'source':0,'target':index++,'value':1});
      //_this.clear();
      //_this.render(data, centre);
    });
  }, 1000);
};
