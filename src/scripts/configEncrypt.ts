import * as fs from 'fs';
import * as crypto from 'crypto';

const env = process.argv[2];
const password = process.argv[3];
const configurationFile = 'config.' + env + '.json';

const configString = fs.readFileSync(configurationFile, 'utf8');

const cipher = crypto.createCipher('aes-256-ctr', password);
let crypted = cipher.update(configString,'utf8','base64');
crypted += cipher.final('base64');

const outputFile = 'config.' + env + '.secret';
fs.writeFileSync(outputFile, crypted);

console.log(`use environment variable ENV=${env}:${password}`);