import { GlobeIcon } from '@heroicons/react/outline'
import { DownloadIcon, UploadIcon } from '@heroicons/react/solid'
import classNames from 'classnames'
import { Account, Layout } from 'components'
import { ethers } from 'ethers'
import { getLocalAssets } from 'helpers/getAvailableAssets'
import { useAuth, useCustody, useWallet } from 'hooks'
import Head from 'next/head'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'
import ERC20ABI from '../../contracts/erc20.abi.json'
import { appTitle } from '../../libs/page'
import { decimalMax, shortenHex } from '../../libs/utils'
import withAuth from 'components/withAuth';

export type DepositTransaction = {
    date: Date
    symbol: string
    contract: string
    amount: string
    txId: string
    id: number
}

function History(): JSX.Element {
    const auth = useAuth()
    const { active, account, chain, connectorInfo, signer } = useWallet()
    const [transactions, setTransactions] = useState<DepositTransaction[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const custody = useCustody(
        process.env.NEXT_PUBLIC_CUSTODY_CONTRACT!,
        signer!,
        auth.getKey(),
    )
    const tabs = [
        {
            name: 'Deposit',
            href: '/history/deposit',
            icon: DownloadIcon,
            current: true,
        },
        {
            name: 'Withdrawal',
            href: '/history/withdrawal',
            icon: UploadIcon,
            current: false,
        },
    ]

    // Get ethers provider
    const provider = useMemo(() => {
        return active && chain
            ? {
                  decimals: chain.nativeCurrency.decimals,
                  rpc: new ethers.providers.JsonRpcProvider(chain.rpc[0]),
              }
            : null
    }, [active, chain])

    useEffect(() => {
        if (!custody || !auth || !account || !provider) return
        ;(async () => {
            setLoading(true)
            const assetList = getLocalAssets()
            const deposits = await custody.getDeposited(null, account)

            // map deposit to Transaction
            const transactions = await Promise.all(
                deposits.map(async (d) => {
                    const assetContract = d['args']!['asset']
                    let symbol = ''
                    if (assetContract === ethers.constants.AddressZero)
                        symbol = 'ETH'
                    else {
                        // if address not in local asset
                        const asset = assetList.find(
                            (c) => c.address === assetContract,
                        )
                        if (!asset) {
                            const contract = new ethers.Contract(
                                assetContract,
                                ERC20ABI,
                                provider.rpc,
                            )
                            symbol = await contract.symbol()
                        } else symbol = asset.symbol
                    }
                    const block = await d.getBlock()

                    return {
                        date: new Date(block.timestamp * 1000),
                        symbol: symbol,
                        contract: assetContract,
                        amount: decimalMax(
                            ethers.utils.formatEther(d['args']!['amount']),
                        ),
                        id: +d['args']!['id'],
                        txId: d['transactionHash'],
                    } as DepositTransaction
                }),
            )

            setTransactions(
                transactions.sort((a, b) => {
                    return b.id - a.id
                }),
            )
            setLoading(false)
        })().catch((error: any) => {
            console.log('error', error)
            setLoading(false)
        })
    }, [account, custody, auth])

    return (
        <>
            <Head>
                <title>{appTitle('Deposit History')}</title>
            </Head>
            {!active ? (
                <Layout className="flex flex-grow">
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                fill="none"
                                viewBox="0 0 512 512"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <rect
                                    width="416"
                                    height="288"
                                    x="48"
                                    y="144"
                                    fill="none"
                                    strokeLinejoin="round"
                                    strokeWidth="32"
                                    rx="48"
                                    ry="48"
                                ></rect>
                                <path
                                    fill="none"
                                    strokeLinejoin="round"
                                    strokeWidth="32"
                                    d="M411.36 144v-30A50 50 0 00352 64.9L88.64 109.85A50 50 0 0048 159v49"
                                ></path>
                                <path
                                    strokeWidth="32"
                                    d="M368 320a32 32 0 1132-32 32 32 0 01-32 32z"
                                ></path>
                            </svg>
                            <h3 className="mt-2 text-md font-medium text-gray-900">
                                No wallet
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Get started by connecting a wallet.
                            </p>
                            <div className="mt-6">
                                <Account />
                            </div>
                        </div>
                    </div>
                </Layout>
            ) : (
                <Layout>
                    <div className="bg-white shadow">
                        <div className="px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
                            <div className="py-6 md:flex md:items-center md:justify-between">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        <div className="hidden sm:block">
                                            <Image
                                                className="hidden h-16 w-16 rounded-full sm:block"
                                                src="/images/avatar.jpeg"
                                                alt="avatar"
                                                width={64}
                                                height={64}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center">
                                                <div className="sm:hidden">
                                                    <Image
                                                        className="h-16 w-16 rounded-full sm:hidden"
                                                        src="/images/avatar.jpeg"
                                                        alt="avatar"
                                                        width={64}
                                                        height={64}
                                                    />
                                                </div>
                                                <h1 className="ml-3 text-2xl font-bold leading-7 text-gray-900 sm:leading-9 sm:truncate">
                                                    Welcome,{' '}
                                                    {shortenHex(account, 4)}
                                                </h1>
                                            </div>
                                            <dl className="mt-6 flex flex-col sm:ml-3 sm:mt-1 sm:flex-row sm:flex-wrap">
                                                <dt className="sr-only">
                                                    Company
                                                </dt>
                                                <dd className="flex items-center text-sm text-gray-500 font-medium capitalize sm:mr-6">
                                                    <GlobeIcon
                                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400"
                                                        aria-hidden="true"
                                                    />
                                                    {chain?.name}
                                                </dd>
                                                <dt className="sr-only">
                                                    Account status
                                                </dt>
                                                <dd className="mt-3 flex items-center text-sm text-gray-500 font-medium sm:mr-6 sm:mt-0 capitalize">
                                                    <svg
                                                        className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400"
                                                        x-description="Heroicon name: solid/check-circle"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                                            clipRule="evenodd"
                                                        ></path>
                                                    </svg>
                                                    {connectorInfo?.name}{' '}
                                                    account
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-6">
                        <h2 className="max-w-6xl mx-auto mt-8 px-4 text-lg leading-6 font-medium text-gray-900 sm:px-6 lg:px-8">
                            History
                        </h2>
                        <div className="block">
                            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                                <div className="flex flex-col mt-2">
                                    <div>
                                        <div className="sm:hidden">
                                            <label
                                                htmlFor="tabs"
                                                className="sr-only"
                                            >
                                                Select a tab
                                            </label>
                                            {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
                                            <select
                                                id="tabs"
                                                name="tabs"
                                                className="block w-full focus:ring-indigo-500 focus:border-indigo-500 border-gray-300 rounded-md"
                                                defaultValue={
                                                    tabs.find(
                                                        (tab) => tab.current,
                                                    )?.name
                                                }
                                            >
                                                {tabs.map((tab) => (
                                                    <option key={tab.name}>
                                                        {tab.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="hidden sm:block">
                                            <div className="border-b border-gray-200">
                                                <nav
                                                    className="-mb-px flex space-x-8"
                                                    aria-label="Tabs"
                                                >
                                                    {tabs.map((tab) => (
                                                        <a
                                                            key={tab.name}
                                                            href={tab.href}
                                                            className={classNames(
                                                                tab.current
                                                                    ? 'border-indigo-500 text-indigo-600'
                                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                                                                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
                                                            )}
                                                            aria-current={
                                                                tab.current
                                                                    ? 'page'
                                                                    : undefined
                                                            }
                                                        >
                                                            <tab.icon
                                                                className={classNames(
                                                                    tab.current
                                                                        ? 'text-indigo-500'
                                                                        : 'text-gray-400 group-hover:text-gray-500',
                                                                    '-ml-0.5 mr-2 h-5 w-5',
                                                                )}
                                                                aria-hidden="true"
                                                            />
                                                            <span>
                                                                {tab.name}
                                                            </span>
                                                        </a>
                                                    ))}
                                                </nav>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead>
                                                <tr>
                                                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Date
                                                    </th>
                                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        ID
                                                    </th>
                                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Asset
                                                    </th>
                                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Amount
                                                    </th>
                                                    <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        TxID
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {loading ? (
                                                    <tr
                                                        key={''}
                                                        className="bg-white"
                                                    >
                                                        <td
                                                            colSpan={5}
                                                            className="px-6 py-2 whitespace-nowrap overflow-ellipsis text-sm text-gray-90 text-center"
                                                        >
                                                            <div className="flex justify-center items-center">
                                                                <div className="animate-spin rounded-full h-4 w-4 mr-2 border-b-4 border-blue-500"></div>
                                                                <div>
                                                                    Loading
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ) : transactions.length > 0 ? (
                                                    transactions.map(
                                                        (transaction) => {
                                                            return (
                                                                <tr
                                                                    key={
                                                                        transaction.id
                                                                    }
                                                                    className="bg-white"
                                                                >
                                                                    <td className="px-6 py-2 whitespace-nowrap overflow-ellipsis text-sm text-gray-900">
                                                                        {
                                                                            transaction.date
                                                                                .toISOString()
                                                                                .split(
                                                                                    'T',
                                                                                )[0]
                                                                        }{' '}
                                                                        {transaction.date
                                                                            .toISOString()
                                                                            .split(
                                                                                'T',
                                                                            )[1]
                                                                            .slice(
                                                                                0,
                                                                                8,
                                                                            )}
                                                                    </td>
                                                                    <td className="max-w-0 w-full px-6 py-2 text-right whitespace-nowrap overflow-ellipsis text-sm text-gray-500">
                                                                        {
                                                                            transaction.id
                                                                        }
                                                                    </td>
                                                                    <td className="max-w-0 w-full px-6 py-2 text-right whitespace-nowrap overflow-ellipsis text-sm text-gray-500">
                                                                        {transaction.contract ===
                                                                        ethers
                                                                            .constants
                                                                            .AddressZero ? (
                                                                            transaction.symbol
                                                                        ) : (
                                                                            <a
                                                                                href={
                                                                                    'https://rinkeby.etherscan.io/address/' +
                                                                                    transaction.contract
                                                                                }
                                                                                target="_blank"
                                                                                rel="noreferrer"
                                                                                className="text-indigo-500 hover:text-indigo-700"
                                                                            >
                                                                                {
                                                                                    transaction.symbol
                                                                                }
                                                                            </a>
                                                                        )}
                                                                    </td>
                                                                    <td className="max-w-0 w-full px-6 py-2 text-right whitespace-nowrap overflow-ellipsis text-sm text-gray-500">
                                                                        {decimalMax(
                                                                            transaction.amount,
                                                                            6,
                                                                        )}
                                                                    </td>
                                                                    <td className="px-6 py-2 text-right whitespace-nowrap overflow-ellipsis text-sm text-gray-500">
                                                                        <a
                                                                            href={
                                                                                'https://rinkeby.etherscan.io/tx/' +
                                                                                transaction.txId
                                                                            }
                                                                            target="_blank"
                                                                            rel="noreferrer"
                                                                            className="text-indigo-500 hover:text-indigo-700"
                                                                        >
                                                                            {shortenHex(
                                                                                transaction.txId,
                                                                            )}
                                                                        </a>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        },
                                                    )
                                                ) : (
                                                    <tr
                                                        key={''}
                                                        className="bg-white"
                                                    >
                                                        <td
                                                            colSpan={5}
                                                            className="px-6 py-2 whitespace-nowrap overflow-ellipsis text-sm text-gray-90 text-center"
                                                        >
                                                            No deposit history
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Layout>
            )}
        </>
    )
}

export default withAuth(History);
