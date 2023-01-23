import axios from 'axios';
import Config from 'configs/app';

export const useRefreshToken = async (refreshToken: string, setSessionData: any) => {
    axios.post(`${Config.goTrueURL(window)}/token?grant_type=refresh_token`, {
        refresh_token: refreshToken,
    },{
        headers: {
            apikey: Config.goTrueAnon,
        }
    }).then((response: any) => {
        setSessionData(response.data);
    }).catch(err => console.log('Refresh token error:', err))
};
