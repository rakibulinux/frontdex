export const klineArrayToObject = (el: any) => {
    const [time, open, high, low, close, volume] = el.map((e: any) => {
        switch (typeof e) {
            case 'number':
                return e
            case 'string':
                return Number.parseFloat(e)
            default:
                throw new Error(`unexpected type ${typeof e} in kline: ${el}`)
        }
    })

    return {
        time: time * 1e3,
        open,
        high,
        low,
        close,
        volume,
    }
}
