import React from 'react';
import { render, screen, cleanup, getByText } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OpenOrdersWidget } from './index';
import TestWrapper from 'components/TestWrapper'
import { localeDate } from 'helpers';

const data = {
    markets: {
        markets: [
            {
                id: 'btcusd',
                name: 'BTC/USD',
                base_unit: 'btc',
                quote_unit: 'usd',
                state: 'enabled',
                amount_precision: 4,
                price_precision: 4,
                min_price: '0.0001',
                max_price: '0',
                min_amount: '0.0001',
                position: 100,
                filters: []
            },
            {
                id: 'ethusd',
                name: 'ETH/USD',
                base_unit: 'eth',
                quote_unit: 'usd',
                state: 'enabled',
                amount_precision: 4,
                price_precision: 4,
                min_price: '0.0001',
                max_price: '0',
                min_amount: '0.0001',
                position: 101,
                filters: []
            },
        ],
        currentMarket: {
            id: 'btcusd',
            name: 'BTC/USD',
            base_unit: 'btc',
            quote_unit: 'usd',
            state: 'enabled',
            amount_precision: 4,
            price_precision: 4,
            min_price: '0.0001',
            max_price: '0',
            min_amount: '0.0001',
            position: 100,
            filters: []
        },
    },
    openOrders: {
        list: [{
            market: 'btcusd',
            id: 1111,
            uuid: '1026258',
            side: 'sell',
            state: 'wait',
            ord_type: 'l',
            price: '4.44',
            avg_price: '4.44',
            remaining_volume: '123456.123456',
            origin_volume: '654321.654321',
            executed_volume: '0',
            trades_count: 0,
            created_at: '1645561342',
            updated_at: '1645561342'
        },
        {
            market: 'ethusd',
            id: 2222,
            uuid: '1026262',
            side: 'buy',
            state: 'trigger_wait',
            ord_type: 'm',
            price: '5.55',
            avg_price: '5.55',
            remaining_volume: '789.789',
            origin_volume: '987.987',
            executed_volume: '0',
            trades_count: 0,
            created_at: '1993426383',
            updated_at: '1993426383'
        },
        ],
        openOrdersLoading: false
    },
}

function renderComponent() {
    return render(
        <TestWrapper>
            <OpenOrdersWidget />
        </TestWrapper>
    );
}

function isDecimalRendered(num: number, htmlBody: HTMLElement, fixed: number, thousDiv = ','): boolean {
    let int: string = String(Math.trunc(num));
    let frac: string | number = String(num).indexOf('.') == -1 ? '' : String(num).slice(String(num).indexOf('.'));

    frac = frac.slice(0, fixed + 1);
    frac = frac == '' ? '.' : frac;
    for (let i = frac.length; i < fixed + 1; i++) {
        frac = frac + '0';
    }
    for (let i = int.length - 3; i > 0; i -= 3) {
        int = int.slice(0, i) + thousDiv + int.slice(i)
    }
    return getByText(htmlBody, int) != null && getByText(htmlBody, frac) != null;
}

const useAppSelector = jest.spyOn(require('app/hooks'), 'useAppSelector');
useAppSelector.mockImplementation(
    (f: any) => {
        return f(data)
    }
)

const useWebSocketContext = jest.spyOn(require('websockets/WebSockets'), 'useWebSocketContext');
useWebSocketContext.mockReturnValue(
    jest.fn(
        (params: Array<any>) => {
            if (params[2] == 'list_orders' && params[3].length != 0) {
                console.log('Market selected: ' + params[3][0]);
            }
            if (params[2] == 'cancel_order') {
                if (params[3][0] == 'id')
                    console.log(`Order ${params[3][1]} canceled`);
                if (params[3][0] == 'all')
                    console.log('All orders were canceled');
                if (params[3][0] == 'market')
                    console.log(`Orders for ${params[3][1]} market were canceled`);
            }
        }
    )
);

const consoleSpy = jest.spyOn(console, 'log');

beforeEach(() => {
    renderComponent();
});
afterEach(() => {
    cleanup();
})

test('render TradingItem title', () => {
    expect(screen.getByText('Open Orders')).not.toBeNull();
    expect(screen.getByLabelText('Hide other pairs')).not.toBeNull();
    expect(screen.getByText('Cancel All')).not.toBeNull();
});

test('render Table Header', () => {
    const header = screen.getAllByRole('rowgroup')[0];
    const headerTitles = ['Date', 'Market', 'Side', 'Type', 'Price', 'Amount', 'Value', 'Filled', 'Status'];
    headerTitles.forEach((title) => {
        expect(getByText(header, title)).not.toBeNull();
    });
});

test('render Table Content', () => {
    data.openOrders.list.forEach((order, index) => {
        const row = screen.getAllByRole('row')[index + 1];
        const expectedMarket = order.market == 'btcusd' ? 'BTC/USD' : (order.market == 'ethusd' ? 'ETH/USD' : 'unexpected');
        const sideColor = order.side == 'buy' ? 'green' : 'red';
        const type = order.ord_type == 'l' ? 'Limit' : ('m' ? 'Market' : 'unexpected');
        const filled = ((+order.executed_volume / +order.origin_volume) * 100).toFixed(2);
        const statusText = order.state == 'wait' ? 'Open' : (order.state == 'trigger_wait' ? 'Open Trigger' : 'unexpected');
        expect(getByText(row, localeDate(+order.created_at, 'fullDate'))).not.toBeNull();
        expect(getByText(row, expectedMarket)).not.toBeNull();
        expect(getByText(row, order.side.charAt(0).toUpperCase() + order.side.slice(1)).classList.contains(`text-${sideColor}-500`)).toBe(true);
        expect(getByText(row, type)).not.toBeNull();
        expect(isDecimalRendered(+order.price, row, data.markets.currentMarket.price_precision)).toBe(true);
        expect(isDecimalRendered(+order.remaining_volume, row, data.markets.currentMarket.amount_precision)).toBe(true);
        expect(isDecimalRendered(+order.origin_volume, row, data.markets.currentMarket.amount_precision)).toBe(true);
        expect(isDecimalRendered(+filled, row, 2)).toBe(true);
        expect(getByText(row, statusText)).not.toBeNull();
        expect(getByText(row, 'Cancel').classList.contains('text-red-500'));
    })
});

test('trigger "Hide other pairs" checkbox', () => {
    userEvent.click(screen.getByLabelText('Hide other pairs'));
    expect(consoleSpy).toBeCalledWith('Market selected: btcusd');
});

test('trigger "Cancel" button for order', () => {
    userEvent.click(getByText(screen.getAllByRole('row')[1], 'Cancel'));
    expect(consoleSpy).toHaveBeenLastCalledWith(`Order ${data.openOrders.list[0].id} canceled`);
});

test('trigger "Cancel all" button with all pairs', () => {
    userEvent.click(screen.getByText('Cancel All'));
    expect(consoleSpy).toHaveBeenLastCalledWith('All orders were canceled');
});

test.skip('trigger "Cancel all" button with selected market', () => {
    userEvent.click(screen.getByLabelText('Hide other pairs'));
    userEvent.click(screen.getByText('Cancel All'));
    expect(consoleSpy).toHaveBeenLastCalledWith(`Orders for ${data.markets.currentMarket.id} market were canceled`);
});
