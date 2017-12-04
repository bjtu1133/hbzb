'use strict'

let utils = require('./utils');
let fs = require('fs');
let AvgQueue = require('../model/AvgQueue');
const AVG_QUEUE_CAP = 100;

module.exports = class TradeService {
    constructor() {
        let ts = new Date();

        this.fileName = (ts.toLocaleDateString()+"_"+ts.toLocaleTimeString())
                            .replace(/\s+/g,"").replace(/\:/g,"_").replace(/\//g,"_");
        this.dataFilePath = './priceData/'+this.fileName;

        this.tradeFilePath = './tradeData/'+this.fileName; 

        this.lastBuyHBRate = null;
        this.lastSellHBRate = null;

        this.buyHbAvgQueue = new AvgQueue(AVG_QUEUE_CAP);
        this.sellHbAvgQueue = new AvgQueue(AVG_QUEUE_CAP); 

        this.bought = false;
        this.boughtRate = undefined;

        fs.appendFile(this.dataFilePath, '', (err) => {
            if (err) throw err;
            console.log('created log file for Price Data');
        });

        fs.appendFile(this.tradeFilePath, '', (err) => {
            if (err) throw err;
            console.log('created log file for Trade Data');
        });
    }

    process(result) {

        this.buyHbAvgQueue.push(result.buyHBRate);
        this.sellHbAvgQueue.push(result.sellHBRate);

        result.buyHbAvg = this.buyHbAvgQueue.avg;
        result.sellHbAvg = this.sellHbAvgQueue.avg;

        if (this.shouldBuyHB(result)) {
            this.buyHB(result);
        }

        if (this.shouldSellHB(result)) {
            this.sellHB(result);
        }

        utils.printData(result);
        
        fs.appendFile(this.dataFilePath, JSON.stringify(result)+',', (err) => {
            if (err) throw err;
        });
    }

    shouldBuyHB(result) {
        
        if (!this.buyHbAvgQueue.isFull || this.bought) {
            return false;
        } 

        let curRate = result.buyHBRate;
        let curAvg = result.buyHbAvg;

        if (curRate > curAvg + 30) {
            return true;
        } else {
            return false;
        }
    }

    shouldSellHB(result) {
        if (!this.bought || !this.boughtRate) {
            return false;
        }
        let boughtRate = Number(this.boughtRate);
        let sellRate = result.sellHBRate;
        
        if (boughtRate + sellRate > 30) {
            return true;
        } else {
            return false;
        }
    }

    buyHB(result) {
        let message = 'Buy HB at '+result.hbBuyP+'./n'
                    + 'Sell ZB at '+result.zbSellP+'./n';
        fs.appendFile(this.tradeFilePath, message, (err) => {
            if (err) throw err;
        });
        this.bought = true;
        this.boughtRate = result.buyHBRate;
    }

    sellHB(result) {
        let message = 'Sell HB at '+result.hbSellP+'./n'
                    +'Buy ZB at '+result.zbBuyP+'./n';
        fs.appendFile(this.tradeFilePath, message, (err) => {
            if (err) throw err;
        });
        this.bought = false;
        this.boughtRate = undefined;
    }
}