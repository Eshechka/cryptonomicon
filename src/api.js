const API_KEY =
    `ee23eeb7d2c03329354035c15ba6d23249b53ba5bb8790a7c8084731ffdab051`;

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX_OK = "5";
const AGGREGATE_INDEX_INVALID_SUB = "500";
const waitingCurrencies = new Map();
let isSubscribeBTCtoUSD = false;

socket.addEventListener('message', (e) => {
    let { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice, TOSYMBOL: toCurrency, MESSAGE: message } = JSON.parse(e.data);
    
    if (    (type !== AGGREGATE_INDEX_INVALID_SUB && type !== AGGREGATE_INDEX_OK) || 
            (type === AGGREGATE_INDEX_OK && !newPrice) ) {
                return;
            }
    
    //если не удалось подписаться на обновления валюты (USD или BTC)
    if (type === AGGREGATE_INDEX_INVALID_SUB && message === "INVALID_SUB") {
        const { PARAMETER: currencyParameter } = JSON.parse(e.data);
        const invalidCurrency = currencyParameter.slice(9, currencyParameter.lastIndexOf('~'));

        if (!waitingCurrencies.has(invalidCurrency)) {//если этой валюты нет в ожидающих
            subscribeToTikerOnWS(invalidCurrency, "BTC");//подписались на ее курс к BTC
            waitingCurrencies.set(invalidCurrency, null);//записали ее в ожидающие с ценой null
            return;
        }

        newPrice = 'invalid';
        currency = invalidCurrency;
    }


    if (type === AGGREGATE_INDEX_OK && newPrice && toCurrency === "BTC" && waitingCurrencies.has(currency)) {
        if (waitingCurrencies.get(currency) === null) {
            waitingCurrencies.set(currency, newPrice);

            if (!isSubscribeBTCtoUSD) subscribeToTikerOnWS("BTC", "USD");
        } 
    }
    if (type === AGGREGATE_INDEX_OK && newPrice && currency === "BTC" && toCurrency === "USD") {
            waitingCurrencies.forEach((price, currentCurrency) => {
                const priceToBTC = price;
                if (priceToBTC !== null)  
                    tickersHandlers.get(currentCurrency).forEach(fn => fn(newPrice * priceToBTC));
            });
        } 

    if (toCurrency === "USD" || newPrice === 'invalid') {//или это валюта у которой есть цена в USD, или это пришла валюта? которой не удалось подписаться даже на BTC и ее цена будет invalid
        const handlers = tickersHandlers.get(currency) ? tickersHandlers.get(currency) : [];
            handlers.forEach(fn => fn(newPrice));
        }
    });
        
function sendToWS(message) {
    const stringifyMessage = JSON.stringify(message);

    if (socket.readyState === WebSocket.OPEN) {
        socket.send(stringifyMessage);
        return;
    }

    socket.addEventListener('open', () => {
        socket.send(stringifyMessage);
    }, { once: true });
}

function subscribeToTikerOnWS(ticker, toCurrency) {
    const message = {
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~${toCurrency}`]
        }
    sendToWS(message);
}
function unsubscribeToTikerOnWS(ticker, toCurrency) {
    const message = {
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~${toCurrency}`]
        }
    sendToWS(message);
}

export const subscribeToTicker = (tickerName, cb) => {
    const subscribes = tickersHandlers.get(tickerName) || [];
    tickersHandlers.set(tickerName, [...subscribes, cb]);
    subscribeToTikerOnWS(tickerName, "USD");
    if (tickerName === "BTC") isSubscribeBTCtoUSD = true;
}
export const unsubscribeToTicker = (tickerName) => {
    tickersHandlers.set(tickerName, []);

    if (waitingCurrencies.has(tickerName)) {
        unsubscribeToTikerOnWS(tickerName, "BTC");
        waitingCurrencies.delete(tickerName);
    }
    if (tickerName === "BTC") {
        let needSubscribeBTCtoUSD = false;
        for (let priceInBTC of waitingCurrencies.values()) {
            console.log('priceInBTC', priceInBTC);
            if (priceInBTC !== null) {
                needSubscribeBTCtoUSD = true;
                break;
            }
        }

        if (!needSubscribeBTCtoUSD) {
            unsubscribeToTikerOnWS(tickerName, "USD");
            isSubscribeBTCtoUSD = false;
        }
    }
}

window.wait = waitingCurrencies;