function Graph (width, height) {
  this.width = width;
  this.height = height;
  this.container = d3.select('body').append('svg');
  this.canvas = d3.select("body").append("canvas")
      .attr("width", width)
      .attr("height", height);
  this.color = d3.scale.category20();
  this.force = d3.layout.force()
      .charge(-200)
      .linkDistance(200)
      .size([this.width, this.height]);
};

Graph.prototype.render = function (data) {
  var _this = this;
  _this.data = data;

  _this.force
    .nodes(data.nodes)
    .links(data.links)
    .start();

  _this.links = _this.container.selectAll('.link')
    .data(data.links)
    .enter().append('line')
    .attr('class', 'link')
    .style('stroke-width', function(d) { return Math.sqrt(d.value); });

  _this.users = _this.container.selectAll('.node.user')
    .data(_.filter(data.nodes, function(node){ return node.type === 'user'; }))
    .enter().append('circle')
    .attr('class', 'node user')
    .attr('r', 20)
    .style('fill', function(d) { return _this.color(d.group); })
    .call(_this.force.drag)
    .on('click', _this.particle);

  _this.weibos = _this.container.selectAll('.node.weibo')
    .data(_.filter(data.nodes, function(node){ return node.type === 'weibo'; }))
    .enter().append('rect')
    .attr('class', 'node weibo')
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) { return _this.color(d.group); })
    .call(_this.force.drag);

  _this.texts = _this.container.selectAll('.nodetext')
    .data(_.filter(data.nodes, function(node){ return node.type === 'user'; }))
    .enter()
    .append('text')
    .attr('class', 'nodetext')
    .attr('fill', 'white')
    .text(function (d) { return d.name; })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '10px');

  _this.users.append('title')
    .text(function(d) { return d.name; });

  _this.force.on('tick', function() {
    _this.links
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    _this.users
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });

    _this.weibos
      .attr('x', function(d) { return d.x; })
      .attr('y', function(d) { return d.y; });

    _this.texts
      .attr('x', function (d) { return d.x-15; })
      .attr('y', function (d) { return d.y-30; });
  });

};

Graph.prototype.clear = function () {
  this.container.selectAll('.node, .link, .nodetext').remove();
};

Graph.prototype.particle = (function () {
  var z = d3.scale.category20c();
  var i = 0;
  return function (circle) {
    d3.select('svg').append("svg:circle")
      .attr("cx", circle.x)
      .attr("cy", circle.y)
      .attr("r", 1e-6)
      .style("stroke", z(++i))
      .style("stroke-opacity", 1)
      .transition()
      .duration(2000)
      .ease(Math.sqrt)
      .attr("r", 300)
      .style("stroke-opacity", 1e-6)
      .remove();
  };
}());

Graph.prototype.at = function (from, to) {
  var source, target;
  this.data.nodes.forEach(function (node) {
    if (node.uid === from.uid) {
      source = node.uid;
    } else if (node.uid === to.uid) {
      target = node.uid;
    }
  });
  this.clear();
  this.data.links.push({source: source, target: target, value: 1});
  this.render(this.data);
};

Graph.prototype.ray = function (from, to) {
  var _this = this;
  var context = this.canvas.node().getContext("2d");
  var pace = {x: (to.x-from.x)/10, y: (to.y-from.y)/10};
  var times = 0;

  context.lineWidth = 10;

  var interval = setInterval(function () {
    context.clearRect(0, 0, _this.width, height);
    context.save();
    context.globalCompositeOperation = "lighter";
    times++;
    //context.translate(width / 2, height / 2);
    context.strokeStyle = _this.color(_.random(20)) + "";
    context.beginPath();
    context.moveTo(from.x+times*pace.x, from.y+times*pace.y);
    context.lineTo(from.x+(times+1)*pace.x, from.y+(times+1)*pace.y);
    context.stroke();
    context.restore();
    if (times === 10) {
      clearInterval(interval);
      context.clearRect(0, 0, _this.width, height);
    }
  }, 30);
};

Graph.prototype.tweet = function (user, weibo) {
  this.data.nodes.forEach(function (node) {
    var source, target;
    if (user.uid === node.uid) {
      source = this.data.nodes.indexOf(node);
      target = this.data.nodes.push(
        {mid: weibo.mid, name: weibo.mid, type: 'weibo'})-1;
      this.data.links.push({source: source, target: target});
      this.clear();
      this.render(this.data);
    }
  }, this);
};

Graph.prototype.retweet = function (user, weibo) {
  var source, target;
  this.data.nodes.forEach(function (node) {
    if (node.type === 'user' && node.uid === user.uid) {
      source = this.data.nodes.indexOf(node);
    } else if (node.type === 'weibo' && node.mid === weibo.mid) {
      target = this.data.nodes.indexOf(node);
    }
  }, this);
  this.data.links.push({source: source, target: target});
  this.clear();
  this.render(this.data);
};

d3.json('assets/data/tree.json', function (err, json) {
  this.width = 1024;
  this.height = 660;
  json.nodes.forEach(function (node) {
    node.uid = node.group = uuid(); // test
  });
  var graph = new Graph(width, height);
  graph.render(json);
  setTimeout(function () {
    graph.tweet({uid: graph.data.nodes[0].uid, type: 'user'}, {mid: 123});
    setTimeout(function () {
      graph.retweet({uid: graph.data.nodes[1].uid, type: 'user'}, {mid: 123});
    }, 1000);
    //graph.at({uid: 0}, {uid: 1});
    //graph.ray(graph.data.nodes[0], graph.data.nodes[1]);
  }, 2000);
});
