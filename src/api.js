const API_KEY =
    `ee23eeb7d2c03329354035c15ba6d23249b53ba5bb8790a7c8084731ffdab051`;

const searchParams = new URLSearchParams();
searchParams.set("tsyms", "USD");
searchParams.set("api_key", API_KEY);

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX_OK = "5";
const AGGREGATE_INDEX_INVALID_SUB = "500";

socket.addEventListener('message', (e) => {
    let { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data);
    
    if (    (type !== AGGREGATE_INDEX_INVALID_SUB && type !== AGGREGATE_INDEX_OK) || 
            (type === AGGREGATE_INDEX_OK && !newPrice) ) {
                return;
            }

    if (type === AGGREGATE_INDEX_INVALID_SUB) {
        const { PARAMETER: currencyParameter } = JSON.parse(e.data);
        const invalidCurrency = currencyParameter.slice(9, currencyParameter.lastIndexOf('~'));
        newPrice = 'invalid';
        currency = invalidCurrency;
    }
    // setInterval(console.log('!!!!!'),10000);
    const handlers = tickersHandlers.get(currency) ? tickersHandlers.get(currency) : [];
    handlers.forEach(fn => fn(newPrice));
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

function subscribeToTikerOnWS(ticker) {
    const message = {
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USD`]
        }
    sendToWS(message);
}
function unsubscribeToTikerOnWS(ticker) {
    const message = {
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USD`]
        }
    sendToWS(message);
}

export const subscribeToTicker = (tickerName, cb) => {
    const subscribes = tickersHandlers.get(tickerName) || [];
    tickersHandlers.set(tickerName, [...subscribes, cb]);
    subscribeToTikerOnWS(tickerName);
}
export const unsubscribeToTicker = (tickerName) => {
    tickersHandlers.set(tickerName, []);
    unsubscribeToTikerOnWS(tickerName)
}