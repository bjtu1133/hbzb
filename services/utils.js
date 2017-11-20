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

module.exports = {trunkToJsonObject, getPriceByMount};

