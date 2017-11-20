'use strict'

let https = require('https');
let utils = require('./utils');

const URL = 'https://api.huobi.pro/market/depth?symbol=btcusdt&type=step4';
const ERROR_VALIDATION = 'FAIL_VALIDATION';

let getHBDepth = () => {
    return new Promise((resolve,reject)=>{
        let request = https.get(URL, (res) => {
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
                resolve(chunk);
            });
            res.on('err',(e)=>{
                console.log(e);
            });
        });
    });
};
// 当前卖出价格
let getHBAsk = (amount) => {
    return new Promise((resolve,reject) => {
        getHBDepth().then((trunk) => {
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let asks = json.tick.asks;
                for (let ask of asks) {
                    amount -= ask[1];
                    if(amount <= 0) {
                        resolve(ask[0]);
                    }
                }
            }else {
                reject(ERROR_VALIDATION);
            }    
        });
    });
};
//当前买入价格
let getHBBid = (amount)=> {
    return new Promise((resolve,reject) => {
        getHBDepth().then((trunk) => {
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let bids = json.tick.bids;
                //console.log(bids);
                for (let bid of bids) {
                    amount -= bid[1];
                    if(amount <= 0) {
                        resolve(bid[0]);
                    }
                }
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

module.exports = {getHBDepth, getHBAsk, getHBBid};

