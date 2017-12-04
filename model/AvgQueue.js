'use strict'
module.exports = class AvgQueue {
    constructor(cap) {
        this.sum = 0;
        this.size = 0;
        this.cap = cap;
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

    get isFull () {
        return this.size >= this.cap;
    }
}