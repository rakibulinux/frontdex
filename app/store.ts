import { configureStore } from '@reduxjs/toolkit';
import globalSettingsReducer from 'features/globalSettings/globalSettings';
import klineReducer from 'features/kline/kline';
import marketsReducer from 'features/markets/markets';
import orderbookReducer from 'features/orderbook/orderbook';
import tickersReducer from 'features/tickers/tickers';
import orderReducer from 'features/order/order';
import openOrdersReducer from 'features/openOrders/openOrders';
import balancesReducer from 'features/balances/balances';
import currenciesReducer from 'features/currencies/currencies';
import walletsReducer from 'features/wallets/wallets';
import { apiHistorySlice } from 'features/history/historyApi';
import recentTradesReducer from 'features/recentTrades/recentTrades';
import userReducer from 'features/user/user';

export const store = configureStore({
    reducer: {
        globalSettings: globalSettingsReducer,
        kline: klineReducer,
        markets: marketsReducer,
        orderbook: orderbookReducer,
        tickers: tickersReducer,
        order: orderReducer,
        openOrders: openOrdersReducer,
        recentTrades: recentTradesReducer,
        balances: balancesReducer,
        currencies: currenciesReducer,
        wallets: walletsReducer,
        user: userReducer,
        [apiHistorySlice.reducerPath]: apiHistorySlice.reducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(apiHistorySlice.middleware);
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
