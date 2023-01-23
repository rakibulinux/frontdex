import { useCallback, useMemo } from 'react';
import { useWallet } from '.';
import appConfig from '../configs/app';
import { singInTypedDataMetamask, typedDataAPIKey } from '../libs/custody';

export function useAuth() {
  const {
    account
  } = useWallet();

  const keyPath = useMemo(() => {
    return `custody_api-key_${account}`;
  }, [account]);

  const getStorage = useCallback((keep: boolean) => {
    if (typeof window === 'undefined') return;

    if (keep) {
      return window.localStorage;
    } else {
      const w = (window as any);
      w.custodyAuth = w.custodyAuth || {};

      return w.custodyAuth;
    }
  }, [keyPath]);

  const getKey = useCallback(() => {
    const temp = getStorage(false);
    const local = getStorage(true);

    if (!temp || !local) return;

    return temp[keyPath] ?? local[keyPath];
  }, [keyPath]);
  
  // ref: https://github.com/MetaMask/test-dapp/blob/main/src/index.js#L713

  const signInMetaMask = useCallback(async (remember: boolean) => {
    const singInTypedData = typedDataAPIKey({
      name: appConfig.appName,
      version: appConfig.appVersion,
      chainId: `${appConfig.platformChainId}`,
      verifyingContract: process.env.NEXT_PUBLIC_CUSTODY_CONTRACT!,
    }, window.location.origin);

    const signature = await singInTypedDataMetamask(account!, singInTypedData);

    const storage = getStorage(remember);
    storage[keyPath] = signature;

    return signature;
  }, [account, keyPath]);

  const auth = useMemo(() => {
    return {
      keyPath,
      getStorage,
      signInMetaMask,
      getKey,
    };

  }, [account, keyPath] );
  
  return auth;
}
