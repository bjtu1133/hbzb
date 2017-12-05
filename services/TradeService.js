'use strict'

let utils = require('./utils');
let fs = require('fs');
let AvgQueue = require('../model/AvgQueue');
let TrageHBService = require('./TradeHBService');

const AVG_QUEUE_CAP = 200;
const BUY_HB_TRIGGER = 20;
const SELL_HB_TRIGGER = 40;
const BUY_BAR = -300;
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
        
        this.tradeHBService = new TrageHBService();
        
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
        if (this.bought) {
            return false;
        } 

        let curRate = Number(result.buyHBRate);
        let curAvg = Number(result.buyHbAvg);

        if (curRate + BUY_BAR <= 0) {
            return false;
        }

        if (curRate > curAvg + BUY_HB_TRIGGER ) {
            return true;
        } 
        
        return false;    
    }

    shouldSellHB(result) {
        if (!this.bought || !this.boughtRate) {
            return false;
        }
        let boughtRate = Number(this.boughtRate);
        let sellRate = Number(result.sellHBRate);
        
        if (boughtRate + sellRate > SELL_HB_TRIGGER) {
            return true;
        } else {
            return false;
        }
    }

    buyHB(result) {
        this.bought = true;
        this.boughtRate = result.buyHBRate;
        let message = '################'+new Date()+'#################\n'
            +'Buy HB at '+result.hbBuyP+'\n'
            + 'Sell ZB at '+result.zbSellP+'\n'
            +'Avg: ' + result.buyHbAvg+'\n'
            +'Rate: ' + result.buyHBRate+'\n'
            +'Bought Rate: '+ this.boughtRate+'\n';
        fs.appendFile(this.tradeFilePath, message, (err) => {
            if (err) throw err;
        });
    }

    sellHB(result) {
        let message ='################'+new Date()+'#################\n' 
                    +'Sell HB'+result.hbSellP+'\n'
                    +'|Buy ZB at '+result.zbBuyP+'\n'
                    +'|Avg' + result.buyHbAvg+'\n'
                    +'|Rate' + result.buyHBRate+'\n'     
        fs.appendFile(this.tradeFilePath, message, (err) => {
            if (err) throw err;
        });
        this.bought = false;
        this.boughtRate = undefined;
    }
}