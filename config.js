var fs = require('fs')

var environment = process.env.ENV || 'dev'
var configurationFile = 'config.' + environment + '.json'

var config

if (fs.existsSync(configurationFile))
    config = JSON.parse(fs.readFileSync(configurationFile, 'utf8'))
else {
    config = {}
    for (let key in process.env)
        if (key.startsWith('CONFIG_'))
            config[key.substr('CONFIG_'.length)] = process.env[key]
}

module.exports = config