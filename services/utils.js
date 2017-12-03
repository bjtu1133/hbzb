'use strict'


let trunkToJsonObject = (trunk) => {
    let jsonChunk = null;
    try{
        //console.log('trunkToJsonObject');
        jsonChunk = JSON.parse(trunk);
    } catch (e) {
        console.log(e);
    }
    return jsonChunk;
}
//dpArr must be sorted
let getPriceByMount = (dpArr, amount) => {
    for (let dp of dpArr) {
        amount -= dp[1];      
        if(amount <= 0) {
            return dp[0];
        }   
    }
    return null;
}

let printData = (result) => {
    let record = ('买火／卖珠：'+ result.buyHBRate
        + '('+result.buyHbAvg+')'
        + '|卖火／买珠：' + result.sellHBRate
        + '('+result.sellHbAvg+')'
        + '|珠宝买/卖：' + result.zbBuyP +'/'+ result.zbSellP
        + '|火币买/卖：' + result.hbBuyP +'/'+ result.hbSellP
        + '|'+result.tm);
    console.log(record);
}

module.exports = {trunkToJsonObject, getPriceByMount, printData};

