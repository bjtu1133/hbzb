'use strict'
let express = require("express");
let https = require('https');
let http = require('http');
let events = require('events');
let timer = require('timers');
const { URL } = require('url');

var app = express();
/*
var server = app.listen(8081, function () {
 
   var host = server.address().address
   var port = server.address().port
 
   console.log("sever started", host, port)
 
});*/

var EventEmitter = require('events').EventEmitter; 
var event = new EventEmitter(); 

event.on('req_complete', function(hbPrice,zbPrice) { 
    let diff = (zbPrice-hbPrice)*100/hbPrice;
    console.log('火币价格：'+hbPrice
    +'|'+'ZB价格：'+ zbPrice
    +'|'+'差异：'+ diff+'%');     
}); 

setInterval(getLatestPrice,1500);

function getLatestPrice() {
    let hbPrice = -1;
    let zbPrice = -1; 
    
    const reqHB = https.get('https://api.huobi.pro/market/trade?symbol=btcusdt', (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //process.stdout.write(d);
            //console.log("HB Latest");
            //console.log(JSON.parse(chunk).tick.data[0].price);
            hbPrice = JSON.parse(chunk).tick.data[0].price;
            if(zbPrice >= 0){
                event.emit('req_complete',hbPrice,zbPrice);
            }
            
          });
    });
    
    const reqZB = http.get('http://api.zb.com/data/v1/ticker?market=btc_usdt', (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //process.stdout.write(d);
            //console.log("ZB Latest");
            //console.log(JSON.parse(chunk).ticker.last);
            zbPrice = JSON.parse(chunk).ticker.last;
            if(hbPrice >= 0){
                event.emit('req_complete',hbPrice,zbPrice);
            }
          });
    });
}



