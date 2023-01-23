import axios from 'axios';
import Config from 'configs/app';

export function useGoTrueSignin(account: string, library: any, setSessionData: any) {
    const sendChallengeToken = (token: string) => {
        axios.post(`${Config.goTrueURL(window)}/asymmetric_login`, {
            key: account,
            challenge_token_signature: token,
        },{
            headers: {
                apikey: Config.goTrueAnon,
            }
        }).then((response: any) => {
            setSessionData(response.data);
        }).catch(err => console.log('Asymmetric login error:', err))
    };

    const signMessage = async (provider: any, challengeToken: string) => {
        try {
            const signer = provider.getSigner();
            const signature = await signer.signMessage(challengeToken);

            sendChallengeToken(signature);
        } catch (err) {
            console.log('Sign message error:', err);
        }
    };

    const signChallenge = () => {
        axios.post(`${Config.goTrueURL(window)}/sign_challenge`, {
            key: account,
            algorithm: 'ETH'
        },
        {
            headers: {
                apikey: Config.goTrueAnon,
            }
        }).then(async (res: any) => {
            const challengeToken = res.data?.challenge_token;

            signMessage(library!, challengeToken);
        }).catch(err => console.log('Sign challenge error:', err));
    }

    signChallenge();
}
