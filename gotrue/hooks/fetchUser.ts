import axios from 'axios';
import Config from 'configs/app';

export const fetchUser = async (accessToken: string) => {
    return axios.get(
        `${Config.goTrueURL(window)}/user`,
        {
            headers: {
                "Authorization": `Bearer ${accessToken}`, apikey: Config.goTrueAnon
            },
        }).then((res: any) => res.data
        ).catch(err => {
            return {
                code: err.response.code,
                msg: err.response.msg,
            };
        });
}
