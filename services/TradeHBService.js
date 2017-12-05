'use strict'
let config = require('../config/config');
let cryptoJS = require('crypto-js');
let hmacSHA256 = require('crypto-js/hmac-sha256')
let https = require('https');
let moment = require('moment');

const ACCESS_KEY = 'accessKey';
const SECURITY_KEY = 'securityKey';
const ACCOUNT_ID = 'accountId';

const URL_HUOBI_PRO = 'api.huobi.pro';
const PATH_ORDER_ORDERS = 'v1/order/orders';
const PATH_GET_ACCOUNTS = '/v1/account/accounts';
const PATH_BALANCE = '';
const POST = 'POST';

module.exports = class HBTradeService {
    constructor() {
        //console.log(config.getConfig(ACCESS_KEY));
        this.accessKey = config.getConfig(ACCESS_KEY);
        this.securityKey = config.getConfig(SECURITY_KEY);
        this.accountId = config.getConfig(ACCOUNT_ID)
        if(!this.accessKey || !this.securityKey || !this.accountId) {
            throw {err:'config not found'};
        }

        //console.log(this.signSha(POST,URL_HUOBI_PRO,PATH_ORDER_ORDERS));
        /*this.balance.then((data)=>{
            console.log(data);
        });*/
    }

    signSha(method, baseurl, path) {
        var pars = [];
        for (let item in this.body) {
            pars.push(item + "=" + encodeURIComponent(this.body[item]));
        }
        var p = pars.sort().join("&");
        var meta = [method, baseurl, path, p].join('\n');
        console.log(meta);
        var hash = hmacSHA256(meta, this.securityKey);
        var Signature = encodeURIComponent(cryptoJS.enc.Base64.stringify(hash));
        // console.log(`Signature: ${Signature}`);
        p += `&Signature=${Signature}`;
        //console.log(p);
        return p;
    }

    get body() {
        return {
            AccessKeyId: this.accessKey,
            SignatureMethod: "HmacSHA256",
            SignatureVersion: 2,
            Timestamp: moment.utc().format('YYYY-MM-DDTHH:mm:ss'),
        };
    }

    get balance() {
        return new Promise((resolve,reject) => {
            
            let method = `/v1/account/accounts/${this.accountId}/balance`;
            let payload = this.signSha('GET', URL_HUOBI_PRO, method);
            let url = `https://${URL_HUOBI_PRO}${method}?${payload}`;
            
            let request = https.get(url, (res) => {
                let buffers = [];
                res.on('data', (chunk) => {
                    buffers.push(chunk);
                });
                res.on('end',()=>{
                    let wholeData = Buffer.concat(buffers);
                    let dataStr = wholeData.toString('utf8');
                    resolve(dataStr);
                })
                res.on('err',(e)=>{
                    console.log("getBalance Failed "+e);
                });
            });
        });
    }
}