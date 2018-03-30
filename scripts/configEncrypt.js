var fs = require('fs')
var crypto = require('crypto')

let env = process.argv[2]
let password = process.argv[3]
let configurationFile = 'config.' + env + '.json'

let configString = fs.readFileSync(configurationFile, 'utf8')

var cipher = crypto.createCipher('aes-256-ctr', password)
var crypted = cipher.update(configString,'utf8','base64')
crypted += cipher.final('base64')

let outputFile = 'config.' + env + '.secret'
fs.writeFileSync(outputFile, crypted)

console.log('use environment variable ENV=' + env + ':' + password)