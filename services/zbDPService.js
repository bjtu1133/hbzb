'use strict'

let http = require('http');
let utils = require('./utils');

const URL = 'http://api.zb.com/data/v1/depth?market=btc_usdt&size=5&merge=0.01';
const ERROR_VALIDATION = 'FAIL_VALIDATION';

let getZBDepth = () => {
    return new Promise((resolve,reject)=>{
        let request = http.get(URL, (res) => {
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

let getZBAsk = (amount) => {
    return new Promise((resolve,reject)=>{
        getZBDepth().then((trunk)=>{
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let price = utils.getPriceByMount(json.asks,amount);
                resolve(price);
                if(price){
                    resolve(price);
                }
            } else {
                reject(ERROR_VALIDATION);
            } 
        });
    });
};

let getZBBid = (amount) => {
    return new Promise((resolve,reject)=>{
        getZBDepth().then((trunk)=>{
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let price = utils.getPriceByMount(json.bids,amount);
                resolve(price);
                if(price){
                    resolve(price);
                }
            } else {
                reject(ERROR_VALIDATION);
            } 
        });
    });
};

let getZBBidAsk = (amount) => {
    return new Promise((resolve,reject)=>{
        getZBDepth().then((trunk)=>{
            let json = utils.trunkToJsonObject(trunk);
            if(isDPValid(json)) {
                let bid = utils.getPriceByMount(json.bids,amount);
                let ask = utils.getPriceByMount(json.asks,amount);
                resolve({
                    bid : bid,
                    ask : ask,
                    ts : json.timestamp
                });
            } else {
                reject(ERROR_VALIDATION);
            } 
        });
    });
};


let isDPValid = (dp)=>{
    if (dp && dp.asks && dp.bids) {
        return true;
    } else {
        return false;
    }
};

module.exports = {getZBDepth, getZBAsk, getZBBid,getZBBidAsk};