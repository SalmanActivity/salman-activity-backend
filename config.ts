import * as fs from 'fs'
import * as crypto from 'crypto'

export interface Config {
    mongoConnection: string,
    secretKey: string,
    photoStorage: string
}

function loadConfiguration(environment:string): Config {
    let [envFile, envKey] = environment.split(':')

    configurationFile = 'config.' + envFile + '.json'
    if (envKey)
        var configurationFile = 'config.' + envFile + '.secret'

    var config: Config
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
        for (let key in process.env)
            if (key.startsWith('CONFIG_'))
                config[key.substr('CONFIG_'.length)] = process.env[key]
    }
    
    return config
}

let config: Config = loadConfiguration(process.env.ENV || 'dev')

export default config