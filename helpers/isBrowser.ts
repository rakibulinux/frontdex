export const isBrowser = (w?: any) => w ? typeof w !== undefined : typeof window !== 'undefined';
