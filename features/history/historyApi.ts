import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Deposit, Withdraw, Trade, Order } from './types';
import { buildQueryString } from 'helpers';

export const apiHistorySlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/api/v2',
        prepareHeaders(headers) {
            headers.set('content-type', 'application/json');

            return headers;
        },
    }),
    endpoints(builder) {
        return {
            fetchDeposits: builder.query<Deposit[], { page: number | void, limit: number | void }> ({
                query({ page = 1, limit }) {
                    const params = {
                        page,
                        limit,
                    };

                    return `/deposits?${buildQueryString(params)}`;
                },
            }),
            fetchWithdrawals: builder.query<Deposit[], { page: number | void, limit: number | void }> ({
                query({ page = 1, limit }) {
                    const params = {
                        page,
                        limit,
                    };

                    return `/withdraws?${buildQueryString(params)}`;
                },
            }),
            fetchTrades: builder.query<Trade[], { page: number | void, limit: number | void }> ({
                query({ page = 1, limit }) {
                    const params = {
                        page,
                        limit,
                    };
                    return `/trades?${buildQueryString(params)}`;
                },
            }),
            fetchOrders: builder.query<Order[], { page: number | void, limit: number | void, type: string | void }> ({
                query({ page = 1, limit, type = ''}) {
                    const params: any = {
                        page,
                        limit,
                        ...(type === 'open' && { state: ['wait', 'trigger_wait'] }),
                    };

                    return `/trades?${buildQueryString(params)}`;
                },
            }),
        };
    },
});

export const {
    useFetchDepositsQuery,
    useFetchWithdrawalsQuery,
    useFetchTradesQuery,
    useFetchOrdersQuery,
} = apiHistorySlice;
