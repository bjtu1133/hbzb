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
function check() {
    let timeDiff = Math.abs(zbTs-hbTs).toFixed(2);
    
    let buyHB = (zbSell - hbBuy/0.998).toFixed(2);
    let sellHB = (hbSell*0.998- zbBuy).toFixed(2);
    let exp = ((zbSell - hbBuy * 1 / 0.998) + (hbSell * 0.998 - zbBuy)).toFixed(3);
    let dt = new Date();
    
    let result = {
        ts : dt,
        tm : dt.toLocaleDateString()+"|"+dt.toLocaleTimeString(),
        buyHBRate : buyHB,
        sellHBRate : sellHB,
        zbBuyP : zbBuy,
        zbSellP : zbSell,
        hbBuyP : hbBuy,
        hbSellP : hbSell
    }

    if (timeDiff < 2.0) {
        //saveData (result);
        printData (result);
    }
    
    
}

function printData(result) {
    let record = ('买火／卖珠：'+ result.buyHBRate
        + '|卖火／买珠：' + result.sellHBRate
        + '|珠宝买/卖：' + result.zbBuyP +'/'+ result.zbSellP
        + '|火币买/卖：' + result.hbBuyP +'/'+ result.hbSellP
        + '|'+result.tm);
    console.log(record);
}
setInterval(update,4000);
setInterval(check,3000);

/*
hbDPService.getHBBidAsk(BT_PER_TRADE).then((data)=>{
    //console.log(data);
    hbSell = data.bid;
    hbBuy = data.ask;
    hbTs = data.ts/1000;
});*/