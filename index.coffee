glob = require('glob')

questions = []
glob './data/*.json', (err, files) ->
  for file in files
    questions = questions.concat require(file).questions
  hash = {}
  for question in questions
    for tag in question.tags
      if hash[tag]
        hash[tag]++
      else
        hash[tag] = 1
  console.log questions[0]
