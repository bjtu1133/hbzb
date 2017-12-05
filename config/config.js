
'use strict'
let fs = require('fs');

let getConfig = (key) => {
    let configText = fs.readFileSync('./config/configure.json', 'utf8');
    let configObj = JSON.parse(configText);
    return (configObj[key]);
}

module.exports = {getConfig};