<template>
  <div id="app">
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <!-- <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center">
        <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div> -->
      <div class="container">
        <section>
          <div class="flex">
            <div class="max-w-xs">
              <label for="wallet" class="block text-sm font-medium text-gray-700"
                >Тикер</label
              >
              <div class="mt-1 relative rounded-md shadow-md">
                <input
                  type="text"
                  name="wallet"
                  id="wallet"
                  class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                  placeholder="Например DOGE"
                  v-model="ticker"
                  @keydown.enter="add"
                />
              </div>
              <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap">
                <span 
                  class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                  v-for="(suitableTicker, ndx) in suitableTickers"
                  :key="ndx"
                  @click="addSuitableTicker(suitableTicker)"
                >
                  {{suitableTicker}}
                </span>
              </div>
              <div class="text-sm text-red-600"
                v-if="isTickerAdded"
              >Такой тикер уже добавлен</div>
            </div>
          </div>
          <button
            type="button"
            class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            @click="add"
          >
            <!-- Heroicon name: solid/mail -->
            <svg
              class="-ml-0.5 mr-2 h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="#ffffff"
            >
              <path
                d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              ></path>
            </svg>
            Добавить
          </button>
        </section>

        <template v-if="tickers.length">
          <div>
            <button
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 mr-2"
              @click="page = page - 1"
              v-if="page > 1"
            >Назад</button>
            <button
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              @click="page = page + 1"
              v-if="hasNextPage"
            >Вперед</button>
            <div>Фильтр: 
              <input type="text"
                v-model="filter"
              >
            </div>
          </div>
          <hr class="w-full border-t border-gray-600 my-4"/>
          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div
              class="overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
              v-for="t in paginatedTickers"
              :key="t.name"
              @click="selectTicker(t)"
              :class="{
                'border-4' : selectedTicker === t,
                'bg-red-100' : t.price === 'invalid',
                'bg-white' : t.price !== 'invalid'
                      }"
            >
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{t.name}} - USD
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{formatTickerPrice(t.price)}}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button
                class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
                @click.stop="del(t)"
              >
                <svg
                  class="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="#718096"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  ></path></svg>Удалить
              </button>
            </div>

          </dl>
          <hr class="w-full border-t border-gray-600 my-4" />
        </template>
        <section class="relative" v-if="selectedTicker">
          <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
            {{selectedTicker ? selectedTicker.name : ''}} - USD
          </h3>
          <div class="flex items-end border-gray-600 border-b border-l h-64"
            ref="graph"
          >
            <div
              v-for="(bar, ndx) in normalizedGraph"
              :key="ndx"
              ref="graphElement"
              :style="{height: `${bar}%`}"
              class="bg-purple-800 border w-10"
            ></div>

          </div>
          <button
            type="button"
            class="absolute top-0 right-0"
            @click="selectedTicker = null"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              xmlns:svgjs="http://svgjs.com/svgjs"
              version="1.1"
              width="30"
              height="30"
              x="0"
              y="0"
              viewBox="0 0 511.76 511.76"
              style="enable-background:new 0 0 512 512"
              xml:space="preserve"
            >
              <g>
                <path
                  d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                  fill="#718096"
                  data-original="#000000"
                ></path>
              </g>
            </svg>
          </button>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { subscribeToTicker, unsubscribeToTicker } from './api';


export default {
  name: 'App',
  data() {
    return {
      ticker: '',
      tickers: [ ],
      selectedTicker: null,
      graph: [],
      barWidth: 40,
      availableTickers: [],
      page: 1,
      filter: '',
      amountLoadTickers: 6,
      maxGraphElements: 0,
    }
  },

  computed: {
    hasNextPage() {
      return this.filteredTickers.length > this.endToLoadTickers;
    },

    startToLoadTickers() {
      return this.amountLoadTickers * (this.page - 1);
    },

    endToLoadTickers() {
      return this.amountLoadTickers * this.page;
    },

    filteredTickers() {
      return this.tickers.filter(ticker => ticker.name.includes(this.filter));
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startToLoadTickers, this.endToLoadTickers);
    },

    suitableTickers() {
      let suitableTickers = [];

      if (this.ticker) {
        this.availableTickers.forEach(t => {
          const searchedWord = t.slice(0, this.ticker.length);
          if (suitableTickers.length > 3) return;
          else 
            if (searchedWord === this.ticker) {
              suitableTickers.push(t);
            }
        });
      }
      return suitableTickers;
    },

    isTickerAdded() {
      return this.tickers.find(t => t.name === this.ticker);
    },

    normalizedGraph() {
      const max = Math.max(...this.graph);
      const min = Math.min(...this.graph);
      if (min === max) {
        return this.graph.map(() => 50);
      }
      return this.graph.map((bar) => 5 + (bar - min)* 95/(max - min));
    },

    pageStateOptions() {
      return {
        filter: this.filter,
        page: this.page,
      }
    },
  },

  methods: {
    calculateMaxGraphElements() {
      this.$nextTick().then(() => {
        console.log(this.$refs.graph);
        if (this.$refs.graph) {
          const newMaxGraphElements = Math.floor( this.$refs.graph.clientWidth / this.barWidth );
          const delta = this.maxGraphElements - newMaxGraphElements;

          if (delta > 0) {
            this.graph = this.graph.slice(delta);
          }

          this.maxGraphElements = newMaxGraphElements;
        }
      });
      
    },
    
    formatTickerPrice(price) {
      if (price === '-' || price === 'invalid') {
        return '-';
      } 
      return price > 1 
          ? price.toFixed(2) 
          : price.toPrecision(2);
    },

    updateTicker(tickerName, price) {
      const currentTicker = this.tickers.find(t => t.name === tickerName);

      currentTicker.price = price ? price : '-';
      
      if (currentTicker === this.selectedTicker && +currentTicker.price) {
        this.graph.push(currentTicker.price);
        if (this.graph.length > this.maxGraphElements) {
          this.graph.shift();
        }
      }
    },

    add() {
      if (!this.ticker) return;

      const currentTicker = {
        name: this.ticker, 
        price: '-'
      };

      this.tickers = [...this.tickers, currentTicker];//!!!!!!!!!
      
      subscribeToTicker(currentTicker.name, (price) => {
        this.updateTicker(currentTicker.name, price);
      });

      this.ticker='';
      this.filter='';
    },

    del(tickerToRemove) {
      this.tickers = this.tickers.filter((ticker) => 
        ticker !== tickerToRemove
      );
      if (tickerToRemove === this.selectedTicker) this.selectedTicker = null;
      unsubscribeToTicker(tickerToRemove.name);
    },

    selectTicker(clickedTicker) {
      this.selectedTicker = clickedTicker;
      this.graph = [];
      this.calculateMaxGraphElements();
    },

    addSuitableTicker(suitableTicker) {
      this.ticker = suitableTicker;
      if (!this.isTickerAdded) this.add();
    },
  },

  created() {
    const urlData = Object.fromEntries(new URL(window.location).searchParams.entries());

    if (urlData.filter) {
      this.filter = urlData.filter;
    }
    if (urlData.page) {
      this.page = urlData.page;
    }

    const tickersData = localStorage.getItem('cryptonomicon-list');
    
    if (tickersData) {
      this.tickers = JSON.parse(tickersData);

      this.tickers.forEach(ticker => {
        subscribeToTicker(ticker.name, (price) => {
          this.updateTicker(ticker.name, price);
        });
      });
    }
  },

  async mounted() {
    const responce = await fetch(`https://min-api.cryptocompare.com/data/blockchain/list?api_key=ee23eeb7d2c03329354035c15ba6d23249b53ba5bb8790a7c8084731ffdab051`);
    const data = await responce.json();
    for (let t in data.Data) this.availableTickers.push(t);

    window.addEventListener('resize', this.calculateMaxGraphElements);
  },

  watch: {
    filter() {
      this.page = 1;
    },
    pageStateOptions(value) {
      window.history.pushState(
        null,
        '',
        `${window.location.pathname}?filter=${value.filter}&page=${value.page}`
      );
    },
    paginatedTickers() {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },
    tickers() {
        localStorage.setItem('cryptonomicon-list', JSON.stringify(this.tickers.map(t => {
          t.price = t.price ? t.price : `-`; 
          return t;
        })));
    },
  }

}
</script>

<style src="./app.css">

</style>