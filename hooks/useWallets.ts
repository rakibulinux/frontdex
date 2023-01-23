import { useAppDispatch, useAppSelector } from "app/hooks";
import { saveWallets } from "features/wallets/wallets";
import { useEffect } from "react";

export function useWallets() {
    const dispatch = useAppDispatch()
    const balances = useAppSelector(state => state.balances.balances)
    const balancesLoading = useAppSelector(state => state.balances.loading)

    const currencies = useAppSelector(state => state.currencies.list)
    const currenciesLoading = useAppSelector(state => state.currencies.loading)

    useEffect(() => {
        if (!balancesLoading && !currenciesLoading) {
            dispatch(saveWallets({ balances, currencies }))
        }
    }, [balances, currencies]);
}
