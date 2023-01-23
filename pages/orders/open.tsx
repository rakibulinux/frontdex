import { TableWithPagination } from '@openware/react-opendax/build'
import { Layout } from 'components'
import { appTitle } from 'libs/page'
import Head from 'next/head'
import React, { FC, useState } from 'react'
import { tableData, tableHeaderTitles } from '../../helpers/orderHelpersData'
import withAuth from 'components/withAuth';

const OpenOrders: FC<{}> = (): JSX.Element => {
    const numberOfRowsOnPage = 20
    const lastElemIndex = Math.ceil(tableData.length / numberOfRowsOnPage)

    const [rowFrom, setRowFrom] = useState(0)
    const [rowTo, setRowTo] = useState(numberOfRowsOnPage - 1)
    const [currentPage, setCurrentPage] = useState(1)
    return (
        <>
            <Head>
                <title>{appTitle('Trading')}</title>
            </Head>
            <Layout className="flex flex-grow">
                <div className="flex flex-col md:flex-row h-screen w-full p-2">
                    <TableWithPagination
                        mainBlockClassName={
                            'w-full h-full border rounded-lg shadow min-w-max h-100 overflow-auto'
                        }
                        data={tableData}
                        headers={tableHeaderTitles}
                        firstShowRowIndex={rowFrom}
                        lastShowRowIndex={rowTo}
                        firstElemIndex={1}
                        lastElemIndex={lastElemIndex}
                        total={lastElemIndex > 6 ? 6 : lastElemIndex}
                        separator={'...'}
                        page={currentPage}
                        onClickLeft={() => {
                            setRowFrom(rowFrom - numberOfRowsOnPage)
                            setRowTo(rowTo - numberOfRowsOnPage)
                            setCurrentPage(currentPage - 1)
                        }}
                        onClickRight={() => {
                            setRowFrom(rowFrom + numberOfRowsOnPage)
                            setRowTo(rowTo + numberOfRowsOnPage)
                            setCurrentPage(currentPage + 1)
                        }}
                        onClickElem={(n: number) => {
                            setRowFrom((n - 1) * numberOfRowsOnPage)
                            setRowTo(n * numberOfRowsOnPage - 1)
                            setCurrentPage(n)
                        }}
                    />
                </div>
            </Layout>
        </>
    )
}

export default withAuth(OpenOrders);
