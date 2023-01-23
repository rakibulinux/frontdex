import axios from 'axios';
import Config from 'configs/app';
import { setUser } from 'features/user/user';
import { store } from 'app/store';

export const useGoTrueLogout = async () => {
    const currentSession = typeof window !== 'undefined' && localStorage.getItem('session');
    const session = currentSession && JSON.parse(currentSession);
    const accessToken = session && session.access_token;

    const emptyUser = {
        created_at: '',
        email: '',
        email_change_confirm_status: 0,
        id: '',
        last_sign_in_at: '',
        phone: '',
        role: '',
        updated_at: '',
    };

    axios.post(`${Config.goTrueURL(window)}/logout`, {},{
        headers: {
            apikey: Config.goTrueAnon,
            "Authorization": `Bearer ${accessToken}`,
        }
    }).then((response: any) => {
        localStorage.removeItem('session');
        store.dispatch(setUser(emptyUser));
    }).catch(err => console.log('Refresh token error:', err))
};
