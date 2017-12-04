'use strict'

module.exports = class ComparedDepthResult {
    constructor(
        hbBuy,
        hbSell,
        zbBuy,
        zbSell,
        dt
    ) {
        this.ts = dt ;
        this.tm = dt.toLocaleDateString()+"|"+dt.toLocaleTimeString();
        this.buyHBRate = (zbSell - hbBuy/0.998).toFixed(2);
        this.sellHBRate = (hbSell*0.998- zbBuy).toFixed(2);
        this.hbBuyP = zbBuy;
        this.hbSellP = hbSell;
        this.zbBuyP = zbBuy;
        this.zbSellP = zbSell;
    }
}