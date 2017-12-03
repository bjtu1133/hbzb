'use strict'

let utils = require('./utils');
let fs = require('fs');
const AVG_QUEUE_CAP = 100;

module.exports = class TradeService {
    constructor() {
        let ts = new Date();

        this.fileName = (ts.toLocaleDateString()+"_"+ts.toLocaleTimeString())
                            .replace(/\s+/g,"").replace(/\:/g,"_").replace(/\//g,"_");
        this.filePath = './priceData/'+this.fileName;

        this.lastBuyHb = 0;
        this.lastSellHb = 0;

        this.buyHbAvgQueue = new AvgQueue();
        this.sellHbAvgQueue = new AvgQueue(); 

        fs.appendFile(this.filePath, '', (err) => {
            if (err) throw err;
            console.log('created log file for PersistData Service');
        });
    }

    process(result) {

        this.buyHbAvgQueue.push(result.buyHBRate);
        this.sellHbAvgQueue.push(result.sellHBRate);

        result.buyHbAvg = this.buyHbAvgQueue.avg;
        result.sellHbAvg = this.sellHbAvgQueue.avg;

        utils.printData(result);
        
        fs.appendFile(this.filePath, JSON.stringify(result)+',', (err) => {
            if (err) throw err;
        });
    }
}

class AvgQueue {
    constructor() {
        this.sum = 0;
        this.size = 0;
        this.cap = AVG_QUEUE_CAP;
        this.avgQueue = [];
    }

    push(rate) {
        rate = Number(rate);
        if (this.size < this.cap) {
            this.size ++;
            this.sum = this.sum + rate;
        } else {
            let fst = this.avgQueue.shift();
            this.sum = this.sum - fst + rate;
        }
        this.avgQueue.push(rate);
    }

    get avg () {
        if (this.size == 0) {
            return 0;
        }
        //console.log(this.avgQueue);
        //console.log(this.sum);
        //console.log(this.size);
        return (this.sum / this.size).toFixed(2);
    }
}