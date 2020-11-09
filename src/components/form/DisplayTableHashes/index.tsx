import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'

import { ExternalLink } from 'components/navigation/ExternalLink'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { FlexRow } from 'components/pureStyledComponents/FlexRow'
import { Hash } from 'components/text/Hash'
import { customStyles } from 'theme/tableCustomStyles'
import { getOmenMarketURL } from 'util/tools'
import { HashArray } from 'util/types'

interface Props {
  hashes: Array<HashArray>
  callbackOnHistoryPush?: () => void
  titleTable: string
  url: string
}

export const DisplayTableHashes = (props: Props) => {
  const { callbackOnHistoryPush, hashes, titleTable, url } = props

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: ({ hash, title }: HashArray) => {
          if (title) {
            return (
              <FlexRow>
                {title}
                <ExternalLink href={getOmenMarketURL(hash)} />
              </FlexRow>
            )
          } else {
            return (
              <Hash
                externalLink
                {...(url && { href: `/${url}/${hash}` })}
                onClick={() => {
                  if (typeof callbackOnHistoryPush === 'function') callbackOnHistoryPush()
                }}
                value={hash}
              />
            )
          }
        },
        name: titleTable,
      },
    ]
  }, [callbackOnHistoryPush, titleTable, url])

  return (
    <DataTable
      className="outerTableWrapper condensedTable"
      columns={getColumns()}
      customStyles={customStyles}
      data={hashes || []}
      noDataComponent={<EmptyContentText>No {titleTable.toLowerCase()} found.</EmptyContentText>}
      noHeader
      pagination
      paginationPerPage={5}
      paginationRowsPerPageOptions={[5, 10, 15]}
    />
  )
}
