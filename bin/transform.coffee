fs = require('fs')
rows = fs.readFileSync('./assets/data/users.txt', 'utf8')
graph = {
  nodes: [],
  links: []
  }
for row in rows.split('\n')
  [uid, name] = row.split('\t')
  if uid
    graph.nodes.push({uid: uid, name: name.trim(), type: 'user'})

console.log JSON.stringify(graph)
