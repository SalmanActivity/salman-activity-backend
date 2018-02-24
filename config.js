var fs = require('fs')

var environment = process.env.ENV || 'dev'
var configurationFile = 'config.' + environment + '.json'

module.exports = JSON.parse(fs.readFileSync(configurationFile, 'utf8'))