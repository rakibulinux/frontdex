import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    generateSocketURI,
    marketKlineStreams,
    streamsBuilder,
} from './helpers';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useRouter } from 'next/router';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { setTickers } from 'features/tickers/tickers';
import { saveMarkets, resetMarketsLoading } from 'features/markets/markets';
import { orderbookIncrement, orderbookSnapshot, resetOrderBookLoading } from 'features/orderbook/orderbook';
import { klinePush, klineSave, resetKlineLoading } from 'features/kline/kline';
import { saveOpenOrders, updateOpenOrders, resetOpenOrdersLoading } from 'features/openOrders/openOrders';
import { updateBalances } from 'features/balances/balances';
import { saveCurrencies } from 'features/currencies/currencies';

interface Props {
    children: ReactNode;
}

const defaultValut: any | null = null;

const WebSocketContext = createContext(defaultValut);

export const REQUEST_CODE = 1;
export const RESPONSE_CODE = 2;
export const PUBLIC_EVENT_CODE = 3;
export const PRIVATE_EVENT_CODE = 4;

export default function WebSocketWrapper({ children, ...props }: Props) {
    const [ publicSubs, setPublicSubs ] = useState<string[] | undefined>(undefined);
    const [ privateSubs, setPrivateSubs ] = useState<string[] | undefined>(undefined);

    const [ socketUrl, setSocketUrl ] = useState<string | null>(null);
    const [ messages, setMessages ] = useState<object[]>([]);

    const dispatch = useAppDispatch();
    const router = useRouter();

    const user = useAppSelector((state) => state.user.user);
    const userLoading = useAppSelector((state) => state.user.userLoading);
    const currentMarket = useAppSelector(state => state.markets.currentMarket);
    const previousSequence = useAppSelector(state => state.orderbook.sequence);
    const kline = useAppSelector(state => state.kline);

    const userLoggedIn = useMemo(() => {
        return Boolean(user?.id);
    }, [user]);

    // generate streams list for first WS connection
    useEffect(() => {
        if (!userLoading && !socketUrl) {
            const streams = streamsBuilder(userLoggedIn, currentMarket, router.pathname);

            if (streams.public.length || streams.private.length) {
                setSocketUrl(generateSocketURI([...streams.public, ...streams.private]));
            }
        }
    }, [userLoggedIn, currentMarket, userLoading, router, socketUrl]);

    // handle change subscriptions
    useEffect(() => {
        if (!userLoading && (typeof(publicSubs) !== 'undefined' || typeof(privateSubs) !== 'undefined')) {
            const streams = streamsBuilder(userLoggedIn, currentMarket, router.pathname);

            const subscribePubStreams = streams.public.filter(i => !publicSubs?.includes(i));
            if (subscribePubStreams.length) {
                subscribe("public", subscribePubStreams);
            }

            const subscribePrivStreams = streams.private.filter(i => !privateSubs?.includes(i));
            if (subscribePrivStreams.length) {
                subscribe("private", subscribePrivStreams);
            }

            // TODO: unsubscribe when changing page
            // const unsubscribePubStreams = publicSubs?.filter(i => !streams.public.includes(i) && !(isTradingPage(router.pathname) && i.includes('kline')));
            // if (unsubscribePubStreams && unsubscribePubStreams.length) {
            //     unsubscribe("public", unsubscribePubStreams);
            // }
        }
    }, [userLoggedIn, currentMarket, userLoading, router.pathname, publicSubs, privateSubs ]);

    // handle k-line subscriptions
    useEffect(() => {
        if (kline.marketId && kline.period) {
            switch (kline.message) {
                case 'subscribe':
                    subscribe('public', marketKlineStreams(kline.marketId, kline.period).channels);
                    break;
                case 'unsubscribe':
                    unsubscribe('public', marketKlineStreams(kline.marketId, kline.period).channels);
                    break;
                default:
                    break;
            }
        }
    }, [kline.period, kline.marketId, kline.message]);

    // handle main websocket events
    const {
        sendJsonMessage,
        lastJsonMessage,
        readyState,
    } = useWebSocket(socketUrl, {
        onOpen: () => {
            console.log('WebSocket connection opened');

            for (const m of messages) {
                sendJsonMessage(m);
            }

            setMessages([]);
        },
        onClose: () => {
            console.log("WebSocket connection closed");
        },
        onError: error => {
            dispatch(resetKlineLoading());
            dispatch(resetMarketsLoading());
            dispatch(resetOpenOrdersLoading());
            dispatch(resetOrderBookLoading());
            console.log(`WebSocket error ${error}`);
            console.dir(error);
        },
        // Will attempt to reconnect on all close events, such as server shutting down
        shouldReconnect: (closeEvent) => true,
        retryOnError: true,
    });

    // empty buffer messages
    useEffect(() => {
        if (messages.length) {
            for (const m of messages) {
                sendJsonMessage(m);
            }

            setMessages([]);
        }
    }, [messages]);

    const postMessage = useCallback(data => {
        if (readyState === ReadyState.OPEN) {
            sendJsonMessage(data);
        } else {
            setMessages(messages => [ ...messages, data]);
        }
    }, [readyState, messages]);

    const subscribe = useCallback((scope: string, streams: string[]) => {
        postMessage([ REQUEST_CODE, 1, "subscribe", [ scope, [ ...streams ]]]);
    }, []);

    const unsubscribe = useCallback((scope: string, streams: string[]) => {
        postMessage([ REQUEST_CODE, 1, "unsubscribe", [ scope, [ ...streams ]]]);
    }, []);

    // handle websocket events
    useEffect(() => {
        if (lastJsonMessage) {
            switch (lastJsonMessage[0]) {
                case PUBLIC_EVENT_CODE:
                    const publicKey = lastJsonMessage[1];
                    const publicPayload = lastJsonMessage[2];

                    // orderbook events
                    const orderBookMatchSnap = publicKey.match(/([^.]*)\.obs/);
                    const orderBookMatchInc = publicKey.match(/([^.]*)\.obi/);

                    if (orderBookMatchSnap) {
                        if (orderBookMatchSnap[1] === currentMarket?.id) {
                            dispatch(orderbookSnapshot(publicPayload));
                        }

                        return;
                    }

                    if (orderBookMatchInc) {
                        if (orderBookMatchInc[1] === currentMarket?.id) {
                            if (previousSequence === null) {
                                console.log('OrderBook increment received before snapshot');

                                return;
                            }

                            if (previousSequence + 1 !== publicPayload[0]) {
                                console.log(`Bad sequence detected in incremental orderbook previous: ${previousSequence}, event: ${publicPayload[0]}`);

                                return;
                            }

                            dispatch(orderbookIncrement(publicPayload));
                        }

                        return;
                    }

                    // kline events
                    const klineMatch = String(publicKey).match(/([^.]*)\.kline-(.+)/);
                    if (klineMatch) {
                        dispatch(klinePush({
                            marketId: klineMatch[1],
                            kline: publicPayload,
                            period: klineMatch[2],
                        }));

                        return;
                    }

                    if (publicKey === 'tickers') {
                        dispatch(setTickers(publicPayload));
                        return;
                    }

                case RESPONSE_CODE:
                    const responseKey = lastJsonMessage[2];
                    const responsePayload = lastJsonMessage[3];

                    switch (responseKey) {
                        // [1,1,"subscribe",["public", ["order", "trade"]]]
                        case 'subscribe':
                        case 'unsubscribe':
                            if (responsePayload[0] === 'public') {
                                setPublicSubs(responsePayload[1]);
                            } else {
                                setPrivateSubs(responsePayload[1]);
                            }

                            return;

                        case 'get_markets':
                            dispatch(saveMarkets(responsePayload));
                            return;
                        case 'get_klines':
                            dispatch(klineSave(responsePayload));
                            return;
                        case 'list_orders':
                            dispatch(saveOpenOrders(responsePayload));
                            return;
                        case 'get_currencies':
                            dispatch(saveCurrencies(responsePayload));
                            return;
                        default:
                            break;
                    }
                case PRIVATE_EVENT_CODE:
                    const privateKey = lastJsonMessage[1];
                    const privatePayload = lastJsonMessage[2];

                    switch (privateKey) {
                        case 'on':
                        case 'ou':
                        case 'or':
                        case 'oc':
                            if (currentMarket && (privatePayload[0] === currentMarket.id)) {
                                dispatch(updateOpenOrders(privatePayload));
                            }

                            // TODO: update order history
                            // dispatch(userOrdersHistoryRangerData(event));

                            break;

                        case 'bu':
                            dispatch(updateBalances(privatePayload));
                            break;
                        default:
                            break;
                    }
                default:
                    break;
            }
        }
    }, [lastJsonMessage]);

    return (
        <WebSocketContext.Provider value={postMessage}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    return useContext(WebSocketContext);
}
