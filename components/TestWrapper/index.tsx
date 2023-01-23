import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { IntlProvider } from 'react-intl';
import appConfig from 'configs/app';
import { LangType, languageMap } from 'translations'
import { store } from 'app/store';

interface TestWrapperProps {
    children: ReactNode;
}

export default function TestWrapper({ children }: TestWrapperProps) {
    const lang = appConfig.languages[0] as LangType;
    return (
        <Provider store={store}>
            <IntlProvider locale={lang} messages={languageMap[lang]} key={lang}>
                {children}
            </IntlProvider>
        </Provider>
    );
}
