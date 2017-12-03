'use strict'

let https = require('https');
let http = require('http');
let hbDPService = require('./services/hbDPService');
let zbDPService = require('./services/zbDPService');
let TradeService = require('./services/TradeService');

const BT_PER_TRADE = 0.2;
const INVALID_PRICE = -1;

let hbTs = INVALID_PRICE;
let hbBuy = INVALID_PRICE;
let hbSell = INVALID_PRICE;

let zbTs = INVALID_PRICE;
let zbBuy = INVALID_PRICE;
let zbSell = INVALID_PRICE;

let tradeService = new TradeService();

setInterval(update,4000);
setInterval(check,6000);

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
    
    if(timeDiff > 2.0 
        || !zbBuy || !zbSell || !hbBuy || !hbSell) {
        console.log('data unsync');
        return;
    }

    let dt = new Date();
    
    let result = {
        ts : dt,
        tm : dt.toLocaleDateString()+"|"+dt.toLocaleTimeString(),
        buyHBRate : (zbSell - hbBuy/0.998).toFixed(2),
        sellHBRate : (hbSell*0.998- zbBuy).toFixed(2),
        zbBuyP : zbBuy,
        zbSellP : zbSell,
        hbBuyP : hbBuy,
        hbSellP : hbSell
    }

    tradeService.process(result);
}


/*
hbDPService.getHBBidAsk(BT_PER_TRADE).then((data)=>{
    //console.log(data);
    hbSell = data.bid;
    hbBuy = data.ask;
    hbTs = data.ts/1000;
});*/