'use strict'

let https = require('https');
let utils = require('./utils');

const URL = 'https://api.huobi.pro/market/depth?symbol=btcusdt&type=step4';
const ERROR_VALIDATION = 'FAIL_VALIDATION';

let getHBDepth = () => {
    return new Promise((resolve,reject)=>{
        let request = https.get(URL, (res) => {
            let buffers = [];
            res.on('data', (chunk) => {
                buffers.push(chunk);
            });
            res.on('end',()=>{
                let wholeData = Buffer.concat(buffers);
                let dataStr = wholeData.toString('utf8');
                resolve(dataStr);
            })
            res.on('err',(e)=>{
                console.log("getHBDepth Failed "+e);
            });
        });
    });
};

//获取当前买入和卖出价格
let getHBBidAsk = (amount)=> {
    return new Promise((resolve,reject) => {
        getHBDepth().then((trunk) => {
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let bid = utils.getPriceByMount(json.tick.bids, amount);
                let ask = utils.getPriceByMount(json.tick.asks, amount);
                resolve({
                    bid : bid,
                    ask : ask,
                    ts : json.ts
                });
            }else {
                reject(ERROR_VALIDATION);
            }    
        });
    });
};

let isDPValid = (dp) => {
    //console.log('check DP json object');
    if(dp && 
        dp.status && dp.status == 'ok' &&
        dp.tick && dp.tick.bids && dp.tick.asks
    ) {
        return true;
    }else {
        return false;
    }
};

module.exports = {getHBDepth, getHBBidAsk};

