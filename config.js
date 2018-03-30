var fs = require('fs')
var crypto = require('crypto')

var environment = process.env.ENV || 'dev'
var [envFile, envKey] = environment.split(':')

if (envKey)
    var configurationFile = 'config.' + envFile + '.secret'
else
    var configurationFile = 'config.' + envFile + '.json'

var config

if (fs.existsSync(configurationFile)) {
    let configString = fs.readFileSync(configurationFile, 'utf8')
    if (envKey) {
        let decipher = crypto.createDecipher('aes-256-ctr', envKey)
        let dec = decipher.update(configString, 'base64', 'utf8')
        dec += decipher.final('utf8')
        configString = dec
    }

    config = JSON.parse(configString)
} else {
    config = {}
    for (let key in process.env)
        if (key.startsWith('CONFIG_'))
            config[key.substr('CONFIG_'.length)] = process.env[key]
}

module.exports = config