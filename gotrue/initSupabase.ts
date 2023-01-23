import { GoTrueClient } from '@supabase/gotrue-js';
import Config from 'configs/app';

const goTrueAuth = new GoTrueClient({
    url: `${Config.goTrueURL(window)}`,
    headers: {
        accept: 'json',
        apikey: Config.goTrueAnon,
    },
})

export const supabase = { goTrueAuth }
