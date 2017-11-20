'use strict'

let https = require('https');
let http = require('http');
let hbDPService = require('./services/hbDPService');
let zbDPService = require('./services/zbDPService');

const BT_PER_TRADE = 0.2;

//单位交易买入价格
function printHBAsk() {
    hbDPService.getHBBid(BT_PER_TRADE).then((data)=>{
        console.log(data);
    });
};
//单位交易卖出价格
function printHBBid() {
    hbDPService.getHBBid(BT_PER_TRADE).then((data)=>{
        console.log(data);
    });
};

function printZBAsk() {
    zbDPService.getZBAsk(BT_PER_TRADE).then((data)=>{
        console.log(data);
    });
};

function printZBBid() {
    zbDPService.getZBBid(BT_PER_TRADE).then((data)=>{
        console.log(data);
    });
};

function updatedate() {

}

setInterval(printZBBid,3000);