'use strict'

let https = require('https');
let http = require('http');
let hbDPService = require('./services/hbDPService');
let zbDPService = require('./services/zbDPService');

const BT_PER_TRADE = 0.2;
const INVALID_PRICE = -1;

let hbTs = INVALID_PRICE;
let hbBuy = INVALID_PRICE;
let hbSell = INVALID_PRICE;

let zbTs = INVALID_PRICE;
let zbBuy = INVALID_PRICE;
let zbSell = INVALID_PRICE;

function update() {
    hbDPService.getHBBidAsk(BT_PER_TRADE).then((data)=>{
        //console.log(data);
        hbSell = data.bid;
        hbBuy = data.ask;
        hbTs = data.ts/1000;
    });
    zbDPService.getZBBidAsk(BT_PER_TRADE).then((data)=>{
        //console.log(data);
        zbSell = data.bid;
        zbBuy = data.ask;
        zbTs = data.ts;
    });
};
function print() {
    let timeDiff = Math.abs(zbTs-hbTs).toFixed(2);
    
    let posD = ((zbSell - hbBuy)*100/hbBuy).toFixed(2);
    let negD = ((zbBuy - hbSell)*100/hbSell).toFixed(2);
    let dt = new Date();
    let record = ('珠卖/火买：'+ posD + '%'
                + '|珠买/火卖：' + negD + '%'
                + '|珠宝买/卖：' + zbBuy +'/'+ zbSell
                + '|火币买/卖：' + hbBuy +'/'+ hbSell
                + '|时间差：'+timeDiff
                + '|'+dt.toLocaleDateString()
                + '|'+dt.toLocaleTimeString());
    console.log(record);
}

setInterval(update,1500);
setInterval(print,4000);