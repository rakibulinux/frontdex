import '@openware/react-opendax/build/index.css'
import { Web3ReactProvider } from '@web3-react/core'
import { store } from 'app/store'
import appConfig from 'configs/app'
import { ethers } from 'ethers'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { IntlProvider } from 'react-intl'
import { Provider } from 'react-redux'
import { LangType, languageMap } from 'translations'
import WebSocketWrapper from 'websockets/WebSockets'
import { appTitle } from '../libs/page'
import '../styles/globals.css'
import '../styles/scss/index.scss'
import { GoTrueAuthWrapper } from 'gotrue/GoTrueAuthWrapper';

const lang = appConfig.languages[0] as LangType

function getLibrary(provider: any): ethers.providers.Web3Provider {
    const library = new ethers.providers.Web3Provider(provider, 'any')
    library.pollingInterval = 12000

    return library
}

export default function App({ Component, pageProps }: AppProps): JSX.Element {
    return (
        <>
            <Head>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>{appTitle()}</title>
            </Head>
            <Web3ReactProvider getLibrary={getLibrary}>
                <Provider store={store}>
                    <GoTrueAuthWrapper>
                        <WebSocketWrapper>
                            <IntlProvider
                                locale={lang}
                                messages={languageMap[lang]}
                                key={lang}
                            >
                                <Component {...pageProps} />
                            </IntlProvider>
                        </WebSocketWrapper>
                    </GoTrueAuthWrapper>
                </Provider>
            </Web3ReactProvider>
        </>
    )
}
