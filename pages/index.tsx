import { appTitle } from 'libs/page'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { FC, useEffect } from 'react'

const Home: FC<{}> = (): JSX.Element => {
    const router = useRouter()

    useEffect(() => {
        router.push('/trading')
    }, [])

    return (
        <>
            <Head>
                <title>{appTitle('Home')}</title>
            </Head>
        </>
    )
}

export default Home
