import { useRouter } from "next/router";
import React, { useEffect, useState } from 'react'
import { User } from 'features/user/types';
import { fetchUser } from 'gotrue/hooks/fetchUser';
import { isBrowser } from 'helpers';

const REDIRECT_TO = '/trading';

const withAuth = (WrappedComponent: any) => {
    return (props: any) => {
        const Router = useRouter();
        const [verified, setVerified] = useState<boolean>(false);
    
        useEffect(() => {
            const currentSession = isBrowser() && localStorage.getItem('session');
            const session = currentSession && JSON.parse(currentSession);
    
            const accessToken = session && session.access_token;
    
            if (!accessToken) {
                Router.replace(REDIRECT_TO);
            } else {
                const fetchUserVerifyToken = async () => {
                    const user: User = await fetchUser(accessToken);
    
                    if (user.id) {
                        setVerified(true);
                    } else {
                        localStorage.removeItem("accessToken");
                        Router.replace(REDIRECT_TO);
                    }
                }
    
                fetchUserVerifyToken();
            }
        }, []);
    
        if (verified) {
            return <WrappedComponent {...props} />;
        } else {
            return null;
        }
    }
};

export default withAuth;
