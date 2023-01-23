import React from 'react';
import { CryptoSVG } from './CryptoSVG';

export interface CryptoIconProps {
    /**
     * Cryptocurrency icon code
     */
    code: string;
    /**
     * Classes for span
     */
    classNameSpan?: string;
    /**
     * Classes for Img
     */
    classNameImage?: string;
    /**
     * Application Code
     */
    children?: React.ReactNode;
}

export const CryptoIcon: React.FunctionComponent<CryptoIconProps> = (props: CryptoIconProps) => {
    const { code, classNameSpan = '', classNameImage = '', children } = props;

    return (
        <span className={classNameSpan}>
            <CryptoSVG name={code.toLowerCase()} className={classNameImage} /> {children}
        </span>
    );
};

CryptoIcon.defaultProps = {
    code: 'BTC',
    classNameImage: 'w-10',
    classNameSpan: ''
}
