import {
    Balance,
    Decimal,
    DropdownItem,
    OrderForm,
    TradingItem,
} from '@openware/react-opendax/build'
import { useAppSelector } from 'app/hooks'
import { OrderExecution, OrderSide } from 'features/order/types'
import { translateOrderType } from 'helpers'
import { cleanPositiveFloatInput } from 'helpers/cleanPositiveFloatInput'
import { getAmount, getTotalPrice } from 'helpers/getTotalPrice'
import { precisionRegExp } from 'helpers/regExp'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { REQUEST_CODE, useWebSocketContext } from 'websockets/WebSockets'
import { DROPDOWN_LIST, TAB_CONTENT } from './constants'
import { ConnectorWalletModal } from 'components'

export const CreateOrderFormWidget: React.FC = () => {
    // TODO: add useMemo and useCallback
    const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState<boolean>(false)
    const [side, setSide] = useState<string>(TAB_CONTENT[0])
    const [orderType, setOrderType] = useState<DropdownItem>(DROPDOWN_LIST[0])
    const [price, setPrice] = useState<string>('')
    const [amount, setAmount] = useState<string>('')
    const [totalPrice, setTotalPrice] = useState<string>()
    const [amountPercentage, setAmountPercentage] = useState<number>(0)
    const [pricePrecision, setPricePrecision] = useState<number>(0)
    const [amountPrecision, setAmountPrecision] = useState<number>(0)

    const user = useAppSelector((state) => state.user.user)
    const currentMarket = useAppSelector((state) => state.markets.currentMarket)
    const asks = useAppSelector((state) => state.orderbook.asks)
    const bids = useAppSelector((state) => state.orderbook.bids)
    const tickers = useAppSelector((state) => state.tickers.tickers)
    const wallets = useAppSelector((state) => state.balances.balances)
    const currentPrice = useAppSelector((state) => state.order.currentPrice)

    const postMessage = useWebSocketContext()
    const intl = useIntl()

    const defaultCurrentTicker = useMemo(() => ({ last: '0' }), [])
    const ticker = useMemo(
        () =>
            (currentMarket && tickers[currentMarket.id]) ||
            defaultCurrentTicker,
        [currentMarket, tickers],
    )

    const translate = useCallback(
        (id: string) => intl.formatMessage({ id }),
        [],
    )

    const getBalance = useCallback(
        (currency: string | undefined, walletsList: Balance[]) => {
            const currencyLower = currency?.toLowerCase()

            return walletsList.find(
                (w) => w.symbol === currencyLower,
            ) as Balance
        },
        [],
    )

    const walletBase = useMemo(
        () => getBalance(currentMarket?.base_unit, wallets),
        [currentMarket, wallets],
    )
    const walletQuote = useMemo(
        () => getBalance(currentMarket?.quote_unit, wallets),
        [currentMarket, wallets],
    )
    const bestOBPrice = useCallback(
        (list: string[][]) => list[0] && list[0][0],
        [],
    )

    const isSideSell = useCallback((type: string) => type === 'sell', [])

    const proposals = useMemo(
        () => (isSideSell(side) ? bids : asks),
        [side, bids, asks],
    )
    const available: number = useMemo(
        () =>
            isSideSell(side)
                ? walletBase?.balance || 0
                : walletQuote?.balance || 0,
        [side, walletBase, walletQuote],
    )
    const priceMarket = useMemo(
        () => +(ticker || defaultCurrentTicker).last,
        [ticker],
    )

    useEffect(() => {
        if (price !== currentPrice) {
            setPrice(currentPrice)
        }
    }, [currentPrice])

    useEffect(() => {
        setPricePrecision(currentMarket?.price_precision || 4)
        setAmountPrecision(currentMarket?.amount_precision || 4)
    }, [currentMarket])

    useEffect(() => {
        if (orderType.name?.toLowerCase() === 'limit') {
            setTotalPrice(String(+amount * +price));
        } else {
            setTotalPrice(String(getTotalPrice(amount, priceMarket, proposals)))
        }

        if (orderType.name?.toLowerCase() === 'market' && totalPrice) {
            const safePrice = +totalPrice / +amount || +priceMarket
            handleInputPrice(Decimal.format(safePrice, pricePrecision), 'price', pricePrecision)
        } else {
            handleInputPrice(price, 'price', pricePrecision)
        }
    }, [amount, priceMarket, proposals, pricePrecision])

    useEffect(() => {
        let newAmount = ''

        switch (side) {
            case 'buy':
                switch (orderType.name.toLowerCase()) {
                    case 'limit':
                        newAmount =
                            available && +price
                                ? String(
                                      (available / +price) * +amountPercentage,
                                  )
                                : ''

                        break
                    case 'market':
                        newAmount = available
                            ? String(
                                  getAmount(
                                      +available,
                                      proposals,
                                      +amountPercentage,
                                  ),
                              )
                            : ''

                        break
                    default:
                        break
                }
                break
            case 'sell':
                newAmount = available
                    ? String(available * +amountPercentage)
                    : ''

                break
            default:
                break
        }

        setAmount(newAmount)
    }, [amountPercentage])

    const renderTitle = useMemo(() => {
        return (
            <p className="text-xs my-2 mx-4 leading-4 tracking-wide font-semibold text-gray-700 uppercase">
                {translate('page.body.trade.header.newOrder')}
            </p>
        )
    }, [])

    const onChangeSide = useCallback((side: string) => {
        setSide(side)
        setOrderType(DROPDOWN_LIST[0])
        setPrice('')
        setAmount('')
    }, [])

    const onChangeType = useCallback((item: any) => {
        setOrderType(typeof item === 'string' ? DROPDOWN_LIST[0] : item)
        setPrice('')
        setAmount('')
    }, [])

    const onChangeInputValue = useCallback(
        (text: string, id: string) => {
            switch (id) {
                case 'price':
                    return handleInputPrice(text, 'price', pricePrecision)
                case 'amount':
                    return handleInputPrice(text, 'amount', amountPrecision)
                default:
                    break
            }
        },
        [pricePrecision, amountPrecision],
    )

    const handleInputPrice = useCallback(
        (value: string, type: string, precision: number) => {
            const convertedValue = cleanPositiveFloatInput(value)

            if (convertedValue.match(precisionRegExp(precision))) {
                switch (type) {
                    case 'price':
                        setPrice(convertedValue);
                        break;
                    case 'amount':
                        setAmount(convertedValue);
                        break;
                    default:
                        break;
                }
            }
        },
        [],
    )

    const handleSubmit = useCallback(() => {
        if (!currentMarket) {
            return
        }

        const orderRequest: OrderExecution = {
            market: currentMarket.id,
            ord_type: translateOrderType(orderType),
            side: side as OrderSide,
            volume: amount,
            price,
        }

        postMessage([
            REQUEST_CODE,
            14,
            'create_order',
            Object.values(orderRequest),
        ])
    }, [currentMarket, orderType, side, amount, price])

    const colorForSideClassName =
        side === 'buy' ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
    const colorForButtonClassName =
        side === 'buy' ? 'bg-green-500' : 'bg-red-500'
    const mainButtonClassName = user?.id ?
        `w-full capitalize inline-flex justify-center items-center relative ${colorForButtonClassName} text-white py-2 rounded` :
        'inline-flex justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-cta-color-main hover:bg-primary-cta-color-hover';

    const TAB_CONTENT_PROPS = {
        tabContent: TAB_CONTENT,
        tabSelectedContent: side,
        tabOnClick: onChangeSide,
        tabBasicButtonClassName:
            'capitalize w-1/2 inline-flex justify-center items-center  relative px-auto py-2  text-gray-400 text-sm font-semibold leading-5  bg-white  border border-gray-200 hover:bg-gray-50',
        tabSelectedButtonClassName: `capitalize w-1/2 inline-flex justify-center items-center relative px-auto py-2  ${colorForSideClassName} text-sm font-semibold leading-5 z-10`,
    }

    const DROPDOWN_CONTENT_PROPS = {
        dropdownList: DROPDOWN_LIST,
        dropdownListSelected: orderType,
        dropdownOnSelect: onChangeType,
    }

    const ORDER_PROPS = {
        onChange: onChangeInputValue,
        percentageOnClick: setAmountPercentage,
        bestBid: +bestOBPrice(bids) || 0,
        bestAsk: +bestOBPrice(asks) || 0,
        price: price,
        amount: amount,
        firstOrderInputCurrency: currentMarket?.quote_unit?.toUpperCase(),
        secondOrderInputCurrency: currentMarket?.base_unit?.toUpperCase(),
        firstOrderInputPlaceholder: translate(
            'page.body.trade.header.newOrder.content.price',
        ),
        SecondOrderInputPlaceholder: translate(
            'page.body.trade.header.newOrder.content.amount',
        ),
        availableAmount: available,
        availableCurrency:
            side === 'buy'
                ? currentMarket?.quote_unit?.toUpperCase()
                : currentMarket?.base_unit?.toUpperCase(),
        totalCurrency: currentMarket?.quote_unit?.toUpperCase(),
        totalAmount: totalPrice ? +totalPrice : 0,
        buttonName:  user?.id !== '' ? side : translate('metamask.connect.wallet'),
        mainButtonClassName: mainButtonClassName,
        onSubmit: user?.id !== '' ? () => handleSubmit() : () => setIsWalletConnectModalOpen(true),
    }

    return (
        <>
            <div className="w-full h-full">
                <TradingItem
                    title={renderTitle}
                    mainClassName="border shadow rounded-md m-0 w-full h-full overflow-auto"
                    contentClassName="w-full h-96 border-t overflow-auto"
                >
                    <OrderForm
                        mainClassName="h-auto p-3"
                        {...TAB_CONTENT_PROPS}
                        {...DROPDOWN_CONTENT_PROPS}
                        {...ORDER_PROPS}
                    />
                </TradingItem>
            </div>
            {/* TODO: move to the Layout */}
            <ConnectorWalletModal showModal={isWalletConnectModalOpen} handleModal={setIsWalletConnectModalOpen}/>
        </>
    )
}

export default CreateOrderFormWidget
