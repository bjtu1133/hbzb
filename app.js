'use strict'
let express = require("express");
let https = require('https');
let http = require('http');
let events = require('events');
let timer = require('timers');
let fs = require('fs');

let app = express();
/*
var server = app.listen(8081, function () {
 
   var host = server.address().address
   var port = server.address().port
 
   console.log("sever started", host, port)
 
});*/

let EventEmitter = require('events').EventEmitter; 
let event = new EventEmitter(); 
let array = [];
let fileCount = 0;
event.on('req_complete', function(hbPrice,zbPrice) { 
    let diff = (zbPrice-hbPrice)*100/hbPrice;
    let date = new Date();
    console.log(
        date.toLocaleTimeString()
        +'|火币价格：'+hbPrice
        +'|'+'ZB价格：'+ zbPrice
        +'|'+'差异：'+ diff+'%');
    if(array.length > 2000){
        let arrayToSave = array;
        array = [];
        event.emit('write_array',arrayToSave);
    }
    array.push(
        {
            'ts' : date.getTime(),
            'hbPrice' : hbPrice,
            'zbPrice' : zbPrice
        }
    );
}); 

event.on('write_array', (array)=>{
    let content = JSON.stringify(array);
    let fileName = 'history_from_'+array[0].ts+'.json';
    fs.writeFile(fileName, content, 'utf8', function (err) {
        if (err) {
            return console.log(err);
        }
    
        console.log("The file was saved!");
    }); 
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



