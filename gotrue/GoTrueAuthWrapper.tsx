import { ReactElement, useEffect, useState } from 'react';
import { useDApp } from '../hooks';
import { useGoTrueSignin, useRefreshToken } from './hooks';
import { useAppDispatch } from 'app/hooks';
import { setUser } from 'features/user/user';
import { fetchUser } from './hooks/fetchUser';

interface Props {
    children: ReactElement;
}

export const GoTrueAuthWrapper: React.FC<Props> = ({ children, ...props }: Props) => {
    const dispatch = useAppDispatch();
    const { context: { account, library } } = useDApp();

    const currentSession = typeof window !== 'undefined' && localStorage.getItem('session');
    const session = currentSession && JSON.parse(currentSession);
    const [expiresIn, setExpiresIn] = useState<string | undefined>(session && session.expires_in);

    const accessToken = session && session.access_token;
    const isMetamaskConnected = typeof window !== 'undefined' && localStorage.getItem('APP_CONNECT_CACHED_PROVIDER');

    const setSessionData = (sessionData: any) => {
        if (sessionData) {
            const updatedSession = {
                access_token: sessionData.access_token,
                refresh_token: sessionData.refresh_token,
                expires_in: sessionData.expires_in
            };

            setExpiresIn(sessionData.expires_in);

            localStorage.setItem('session', JSON.stringify(updatedSession));

            dispatch(setUser(sessionData.user));
        };
    };

    useEffect(() => {
        if (!isMetamaskConnected) {
            localStorage.removeItem('session');
        }

        const setUserToRedux = async (accessToken: string) => {
            const data = await fetchUser(accessToken);

            // TODO: add alert system;
            data.code !== '401' && dispatch(setUser(data));
        }

        accessToken && isMetamaskConnected && setUserToRedux(accessToken);
    }, []);

    useEffect(() => {
        if (expiresIn) {
            const interval = setInterval(() => {
                const currentSession = typeof window !== 'undefined' && localStorage.getItem('session');
                const session = currentSession && JSON.parse(currentSession);
                const refreshToken = session && session.refresh_token;

                if (refreshToken && refreshToken !== 'undefined') {
                    useRefreshToken(refreshToken, setSessionData);
                }
            }, +expiresIn * 1000);

            return () => clearInterval(interval);
        }
    }, [expiresIn]);

    useEffect(() => {
        if (account && !isMetamaskConnected) {
            localStorage.removeItem('session');
        }
    }, [isMetamaskConnected])


    useEffect(() => {
        if (account && !accessToken) {
            useGoTrueSignin(account, library, setSessionData);
        }
    }, [account]);

    return children;
};
