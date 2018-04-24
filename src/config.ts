import * as fs from 'fs';
import * as crypto from 'crypto';

export interface Config {
    mongoConnection: string;
    secretKey: string;
    photoStorage: string;
    trustedDomain?: string;
}

function loadConfiguration(environment:string): Config {
    const [envFile, envKey] = environment.split(':');

    const configurationFile = 'config.' + envFile + '.json';
    if (envKey) {
        const configurationFile = 'config.' + envFile + '.secret';
    }

    let config: Config;
    if (fs.existsSync(configurationFile)) {
        let configString = fs.readFileSync(configurationFile, 'utf8');
        if (envKey) {
            const decipher = crypto.createDecipher('aes-256-ctr', envKey);
            let dec = decipher.update(configString, 'base64', 'utf8');
            dec += decipher.final('utf8');
            configString = dec;
        }

        config = JSON.parse(configString);
    } else {
        for (const key in process.env) {
            if (key.startsWith('CONFIG_')) {
                config[key.substr('CONFIG_'.length)] = process.env[key];
            }
        }
    }
    
    return config;
}

export const config: Config = loadConfiguration(process.env.ENV || 'dev');