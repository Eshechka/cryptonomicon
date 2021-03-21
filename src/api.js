const API_KEY =
    `ee23eeb7d2c03329354035c15ba6d23249b53ba5bb8790a7c8084731ffdab051`;

const searchParams = new URLSearchParams();
searchParams.set("tsyms", "USD");
searchParams.set("api_key", API_KEY);

const tickersHandlers = new Map();
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`);

const AGGREGATE_INDEX = "5";

socket.addEventListener('message', (e) => {
    // console.log(e);
    const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice} = JSON.parse(e.data);
    if (type !== AGGREGATE_INDEX) return;

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


// export const loadTickers = () => {
//     if (tickersHandlers.size === 0) {
//         return;
//     }
//     searchParams.set("fsyms", Array.from(tickersHandlers.keys()).join(','));

//     return fetch(
//         `https://min-api.cryptocompare.com/data/pricemulti?${searchParams.toString()}`
//     )
//         .then(responce => responce.json())
//         .then(rawData => {
            
//             const updatedPrices = Object.fromEntries(
//                 Object.entries(rawData).map(([key, value]) => [key, value.USD])
//                 )
//                 Object.entries(updatedPrices).forEach(([tickerName, tickerPrice]) => {
//                     const handlers = tickersHandlers.get(tickerName) || [];
//                     handlers.forEach(fn => fn(tickerPrice));
//                 });
//             // return updatedPrices;
//             }
//         );
// }

// setInterval(loadTickers, 5000);

export const subscribeToTicker = (tickerName, cb) => {
    const subscribes = tickersHandlers.get(tickerName) || [];
    tickersHandlers.set(tickerName, [...subscribes, cb]);
    subscribeToTikerOnWS(tickerName);
}
export const unsubscribeToTicker = (tickerName) => {
    tickersHandlers.set(tickerName, []);
    unsubscribeToTikerOnWS(tickerName)
}

window.tickers = tickersHandlers;