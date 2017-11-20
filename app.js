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

//use for calculate 3 min avg
let avg = 0;
let sum = 0;
let num = 0;
let avg_queue = [];
//ttnum
let logFileName = 'history.json';
let arrayNum = 0;

event.on('req_complete', function(hbPrice,zbPrice) { 
    let diff = ((zbPrice-hbPrice)*100/hbPrice).toFixed(2);
    let date = new Date();
    console.log(
        date.toLocaleTimeString()
        +'|火币：'+hbPrice
        +'|'+'珠宝：'+ zbPrice
        +'|'+'差异：'+ diff + '%'
        +'|'+'平均：'+ avg + '%');
    
    event.emit('update_avg',diff);

    if(array.length > 10){
        let arrayToSave = array;
        array = [];
        event.emit('switch_log_file',arrayToSave);
    }
    array.push(
        {
            'ts' : date.getTime(),
            'hbPrice' : hbPrice,
            'zbPrice' : zbPrice,
            'diff' : diff,
            'avg' : avg
        }
    );
});

event.on('switch_log_file',(arr)=>{
    if(arrayNum > 90) {
        fs.appendFile(logFileName, ']', 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            logFileName = 'history' + Date.now() + '.json';
            arrayNum = 0;
            event.emit('write_array',arr);
            console.log("The file was switched!");
        }); 
    } else {
        event.emit('write_array',arr);
    }
    
});
event.on('write_array', (arr)=>{
    let content = JSON.stringify(arr);
    fs.exists(logFileName,(exists) => {
        if(!exists) {
            content = '['+content;
        } else {
            content = ','+content;
        }
        fs.appendFile(logFileName, content, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
            arrayNum ++;
        }); 
    });
});

event.on('update_avg',(rateStr)=>{
    let rate = new Number(rateStr);
    sum = new Number(sum);
    
    avg_queue.push(rate);
    if (num >= 10) {
        let fst = avg_queue.shift();
        sum = (sum+rate-fst).toFixed(2);
    } else {
        sum += rate; 
        num ++;
    }

    avg = (sum/num).toFixed(2); 
});


try{
    setInterval(getLatestPrice,2000);
}catch(e) {
    console.log(e);
    setInterval(getLatestPrice,2000);
}

function getLatestPrice() {
    let hbPrice = -1;
    let zbPrice = -1; 
    
    const reqHB = https.get('https://api.huobi.pro/market/trade?symbol=btcusdt', (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //process.stdout.write(chunk);
            //console.log("HB Latest");
            //console.log(JSON.parse(chunk).tick.data[0].price);
            if (chunk) {
                let jsonChunk = null;
                try{
                    jsonChunk = JSON.parse(chunk);
                } catch (e) {
                    return;
                }
                if (jsonChunk
                    &&jsonChunk.tick 
                    && jsonChunk.tick.data 
                    && jsonChunk.tick.data[0]
                    && jsonChunk.tick.data[0].price) {
                    hbPrice = JSON.parse(chunk).tick.data[0].price;
                    if(zbPrice >= 0){
                        event.emit('req_complete',hbPrice,zbPrice);
                    }
                }
            }
        });
        res.on('err',(e)=>{
            console.log(e);
        });
    });
    
    const reqZB = http.get('http://api.zb.com/data/v1/ticker?market=btc_usdt', (res) => {
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
            //process.stdout.write(chunk);
            //console.log("ZB Latest");
            //console.log(JSON.parse(chunk).ticker.last);
            
            if (chunk) {
                let jsonChunk = JSON.parse(chunk);
                if (jsonChunk.ticker 
                    && jsonChunk.ticker.last) {
                    zbPrice = JSON.parse(chunk).ticker.last;
                    if(hbPrice >= 0){
                        event.emit('req_complete',hbPrice,zbPrice);
                    }
                }
            }  
        });
        res.on('err',(e)=>{
            console.log(e);
        });
    });
}



