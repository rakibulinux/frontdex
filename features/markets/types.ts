export type MarketID = string;

export interface MarketFilterCustomStepRule {
    limit: string;
    step: string;
}

export interface MarketFilterCustomStep {
    type: string;
    rules: MarketFilterCustomStepRule[];
}

export interface MarketFilterSignificantDigit {
    type: string;
    digits: number;
}

export type MarketFilter = MarketFilterSignificantDigit | MarketFilterCustomStep;

export type MarketFeature = {
    order_types: string[];
}

export interface Market {
    id: MarketID;
    type: string;
    base_unit: string;
    quote_unit: string;
    state: string;
    position: string;
    amount_precision: number;
    price_precision: number;
    min_price: string;
    max_price: string;
    min_amount: string;
    name: string;
}
