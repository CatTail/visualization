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
      .linkDistance(100)
      .size([this.width, this.height]);
};

Graph.prototype.render = function (data) {
  var _this = this;
  _this.data = data;

  _this.force
    .nodes(data.nodes)
    .links(data.links)
    .start();

  _this.tweets = _this.container.selectAll('.link.tweet')
    .data(_.filter(data.links, function(d){ return d.type === 'tweet'; }))
    .enter().append('line')
    .attr('class', 'link tweet')
    .style('stroke-width', function(d) { return Math.sqrt(d.value); });

  _this.retweets = _this.container.selectAll('.link.retweet')
    .data(_.filter(data.links, function(d){ return d.type === 'retweet'; }))
    .enter().append('line')
    .attr('class', 'link retweet')
    .style('stroke-width', function(d) { return Math.sqrt(d.value); });

  _this.users = _this.container.selectAll('.node.user')
    .data(_.filter(data.nodes, function(node){ return node.type === 'user'; }))
    .enter().append('circle')
    .attr('class', 'node user')
    .attr('r', 12)
    .style('fill', /*'#ccffff'*/function(d) { return _this.color(d.group); })
    .call(_this.force.drag)
    .on('click', _this.particle);

  _this.weibos = _this.container.selectAll('.node.weibo')
    .data(_.filter(data.nodes, function(node){ return node.type === 'weibo'; }))
    .enter()
    //.append('rect')
    .append('circle')
    .attr('class', 'node weibo')
    .attr('r', 3)
    //.attr('width', 10)
    //.attr('height', 10)
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
    _this.tweets
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    _this.retweets
      .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    _this.users
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });

    _this.weibos
      .attr('cx', function(d) { return d.x; })
      .attr('cy', function(d) { return d.y; });

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
    if (node.uid === from) {
      source = this.data.nodes.indexOf(node);
      this.particle(source);
    } else if (node.uid === to) {
      target = this.data.nodes.indexOf(node);
    }
  }, this);
  this.clear();
  this.data.links.push({source: source, target: target, value: 1});
  this.render(this.data);
};

Graph.prototype.ray = function (from, to) {
  var _this = this;
  _this.data.nodes.forEach(function (node) {
    if (node.type === 'user') {
      if (node.uid === from) {
        from = node;
        _this.particle(from);
      } else if (node.uid === to) {
        to = node;
      }
    }
  });
  _.each(this.data.groups, function (group) {
    if (group.members.indexOf(from.name) !== -1) {
      group.score++;
      this.updateStat();
    }
  }, this);
  var context = this.canvas.node().getContext("2d");
  var pace = {x: (to.x-from.x)/10, y: (to.y-from.y)/10};
  var times = 0;

  context.lineWidth = 10;

  var interval = setInterval(function () {
    context.clearRect(0, 0, _this.width, _this.height);
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
      context.clearRect(0, 0, _this.width, _this.height);
    }
  }, 30);
};

Graph.prototype.tweet = function (uid, weibo) {
  this.data.nodes.forEach(function (node) {
    var source, target;
    if (uid === node.uid) {
      _.each(this.data.groups, function (group) {
        if (group.members.indexOf(node.name) !== -1) {
          group.score++;
          this.updateStat()
        }
      }, this);
      source = this.data.nodes.indexOf(node);
      this.particle(node);
      target = this.data.nodes.push(
        {mid: weibo.mid, name: weibo.mid, type: 'weibo'})-1;
      this.data.links.push({source: source, target: target, type: 'tweet'});
      this.clear();
      this.render(this.data);
    }
  }, this);
};

Graph.prototype.retweet = function (uid, mid) {
  var source, target;
  this.data.nodes.forEach(function (node) {
    if (node.type === 'user' && node.uid === uid) {
      _.each(this.data.groups, function (group) {
        if (group.members.indexOf(node.name) !== -1) {
          group.score++;
          this.updateStat();
        }
      }, this);
      source = this.data.nodes.indexOf(node);
      this.particle(node);
    } else if (node.type === 'weibo' && node.mid === mid) {
      target = this.data.nodes.indexOf(node);
    }
  }, this);
  this.data.links.push({source: source, target: target, type: 'retweet'});
  this.clear();
  this.render(this.data);
};

Graph.prototype.updateStat = function () {
  $('#stat tr').remove();
  _.each(this.data.groups, function (group) {
    if (!group.score) {
      group.score = 0;
    }
  }, this);
  this.data.groups = _.sortBy(this.data.groups, function (group) {
    return -group.score;
  });
  var compiled =
    _.template("<tr class=\"<% if(index===0) { %>first<% } %>\"><td class=\"teamname\"><%= groupname %></td><td class=\"teamvalue\"><%= score %></td></tr>");
  _.each(this.data.groups, function (group, index) {
    $('#stat').append($(compiled(_.extend({index: index}, group))));
  });
};

var socket = io.connect('http://192.168.1.114:8090');
d3.json('assets/data/person.json', function (err, json) {
  d3.json('assets/data/group.json', function (err, groups) {
    json.nodes.forEach(function (node) {
      node.group = uuid(); // colors
    });
    json.groups = groups;
    var width = 1024;
    var height = 660;
    var graph = new Graph(width, height);
    graph.render(json);
    graph.updateStat();
    try {
      socket.on('at', function (data) {
        socket.emit('backup', graph.data);
        //graph.at(data.from, data.to);
        console.log(data);
        graph.ray(data.from, data.to);
        setTimeout(function () {
          graph.ray(data.from, data.to);
          setTimeout(function () {
            graph.ray(data.from, data.to);
          }, 300);
        }, 200);
      });
      socket.on('tweet', function (data) {
        socket.emit('backup', graph.data);
        console.log(data);
        graph.tweet(data.uid, {mid: data.mid});
      });
      socket.on('retweet', function (data) {
        socket.emit('backup', graph.data);
        console.log(data);
        graph.retweet(data.uid, data.mid);
      });
      socket.on('resume', function (data) {
        var newData = {};
        newData.nodes = _.map(data.nodes, function (node) {
          return {uid: node.uid, name: node.name, type: node.type, group: uuid()};
        });
        newData.links = _.map(data.links, function (link) {
          return {source: link.source.index, target: link.target.index, type: link.type};
        });
        newData.groups = data.groups ? data.groups : groups;
        graph.clear();
        graph.render(newData);
        graph.updateStat();
      });
    } catch (err) {
      socket.emit('resume');
    }
  });
});

window.onerror = function () {
  window.location = window.location.href;
  return false;
};
