import type { Chain } from 'configs/chains'
import Link from 'next/link'
import React, { FC } from 'react'

type Explorer = {
    name: string
    url: string
    standard: string
}

type ExploreType = 'address' | 'tx' | 'block'

function explorerLink(
    explorer: Explorer,
    type: ExploreType,
    value: string | number,
) {
    return `${explorer.url}/${type}/${value}`
}

function explorerName(explorer: Explorer) {
    return explorer.name
}

type ExplorerLinkProps = {
    chain: Chain
    type: ExploreType
    value: string | number
    Label?: (params: { explorer: Explorer; name: string }) => JSX.Element
}

export const ExplorerLink: FC<ExplorerLinkProps> = ({
    chain,
    type,
    value,
    Label = ({ name }) => <span className="capitalize">{name}</span>,
}: ExplorerLinkProps) => {
    const [explorer] = chain.explorers ?? []

    return (
        <>
            {explorer && (
                <Link href={explorerLink(explorer, type, value)}>
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 truncate"
                    >
                        <Label
                            explorer={explorer}
                            name={explorerName(explorer)}
                        />
                    </a>
                </Link>
            )}
        </>
    )
}
