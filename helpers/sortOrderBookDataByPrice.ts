export const sortOrderBookDataByPrice = (data: string[][], mode: 'ask' | 'desc') => {
    return data.sort((a, b) => mode === 'ask'
      ? Number(a[0]) - Number(b[0])
      : Number(b[0]) - Number(a[0]));
};
