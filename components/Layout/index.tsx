import {
    Layout as SharedLayout,
    navigationApp,
    navigationAppItem,
    SidebarProps,
} from '@openware/react-opendax/build'
import { useAppDispatch, useAppSelector } from 'app/hooks'
import { Account, APIKeyModal, MarketSelectorList, DepositButton, WithdrawButton, DepositModal, WithdrawModal } from 'components'
import {
    navigation,
    navigationLoggedin,
} from 'configs/navigation'
import { PropsWithChildren, useCallback } from 'react'
import React, { useMemo, useState } from 'react'
import { useWallet } from 'hooks';
import chains from 'configs/chains';
import appConfig from '../../configs/app'
import { toggleDepositModal, toggleWithdrawModal } from 'features/globalSettings/globalSettings';

export const { platformChainId } = appConfig;

export function Layout(
    props: PropsWithChildren<{ className?: string }>,
): JSX.Element {
    const [collapseLeftBar, setCollapseLeftBar] = useState<boolean>(true);

    const marketSelectorActive = useAppSelector((state) => state.globalSettings.marketSelectorActive);
    const depositModalActive = useAppSelector((state) => state.globalSettings.depositModalActive);
    const withdrawModalActive = useAppSelector((state) => state.globalSettings.withdrawModalActive);
    const markets = useAppSelector((state) => state.markets.markets);
    const isLoggedin = useAppSelector((state) => state.user.user.id);

    const { chain } = useWallet();
    const dispatch = useAppDispatch();

    const targetChain = React.useMemo(() => {
        return chains.find((c) => c.chainId === platformChainId)
    }, []);

    const navigations = useMemo((): navigationApp[] => {
        const mainNavigation = isLoggedin ? navigationLoggedin : navigation;

        return [{
            app: 'mainapp',
            pathnames: mainNavigation.map<navigationAppItem>((nav: navigationAppItem) => {
                if (nav.submenus?.length) {
                    return {
                        name: nav.name,
                        icon: nav.icon,
                        path: nav.path,
                        submenus: nav.submenus,
                    }
                };

                return {
                    name: nav.name,
                    icon: nav.icon,
                    path: nav.path === '/trading' && markets?.length ? `${nav.path}/${markets[0].id}` : nav.path,
                }
            })
        }];
    }, [isLoggedin, markets]);

    const buttonList = useMemo(() => {
        return isLoggedin
            ? [
                {
                    name: 'Metamask',
                    component: <Account collapseLeftBar={collapseLeftBar} />,
                },
                {
                    name: 'Deposit',
                    component: <DepositButton collapseLeftBar={collapseLeftBar} />
                },
                {
                    name: 'Withdraw',
                    component: <WithdrawButton collapseLeftBar={collapseLeftBar} />
                },
            ]
            : [
                {
                    name: 'Metamask',
                    component: <Account collapseLeftBar={collapseLeftBar} />,
                },
            ]
    }, [isLoggedin, collapseLeftBar]);

    const sidebarProps: SidebarProps = {
        currentApp: 'mainapp',
        navigations: navigations,
        navClassNames:
            'no-underline duration-200 group flex items-center px-2 py-2 text-sm font-medium rounded-md text-cta-contrast',
        navActiveClassNames: 'text-gray-900 bg-gray-100',
        navInactiveClassNames:
            'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
        isLoggedin: false,
        buttonsList: buttonList,
        onSidebarCollapse: (collapseLeftBar: boolean) => {
            setCollapseLeftBar(collapseLeftBar)
        },
    }
    const [showAPIKEYModal, setShowAPIKEYModal] = useState<boolean>(true)

    const renderAPIKeyModal = useMemo(() => {
        return (
            showAPIKEYModal && (
                <APIKeyModal
                    onClose={() => {
                        setShowAPIKEYModal(false)
                    }}
                />
            )
        )
    }, [showAPIKEYModal])

    const handleCloseDeposit = useCallback(() => {
        dispatch(toggleDepositModal({ isOpen: false, asset: undefined }));
    }, []);

    const handleCloseWithdraw = useCallback(() => {
        dispatch(toggleWithdrawModal({ isOpen: false, asset: undefined }));
    }, []);

    return (
        <SharedLayout
            containerClassName={props.className}
            sidebarProps={sidebarProps}
        >
            <>
                {props.children}
                <MarketSelectorList
                    shouldShowMarketSelector={marketSelectorActive}
                />
                {depositModalActive && targetChain &&
                    <DepositModal
                        targetChain={targetChain}
                        chainValid={chain?.chainId === targetChain?.chainId}
                        onClose={handleCloseDeposit}
                    />
                }
                {withdrawModalActive && targetChain &&
                    <WithdrawModal
                        targetChain={targetChain}
                        chainValid={chain?.chainId === targetChain?.chainId}
                        onClose={handleCloseWithdraw}
                    />
                }
                {renderAPIKeyModal}
            </>
        </SharedLayout>
    )
}
