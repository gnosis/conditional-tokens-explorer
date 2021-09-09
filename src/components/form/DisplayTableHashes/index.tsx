import React, { useCallback } from 'react'
import DataTable from 'react-data-table-component'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ExternalLink } from 'components/navigation/ExternalLink'
import { EmptyContentText } from 'components/pureStyledComponents/EmptyContentText'
import { Hash } from 'components/text/Hash'
import { customStyles } from 'theme/tableCustomStyles'
import { HashArray } from 'util/types'

const Text = styled.span`
  display: block;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

interface Props {
  callbackOnHistoryPush?: () => void
  className?: string
  hashes: Array<HashArray>
  titleTable: string
}

export const DisplayTableHashes = (props: Props) => {
  const { callbackOnHistoryPush, className = '', hashes, titleTable } = props

  const getColumns = useCallback(() => {
    return [
      {
        // eslint-disable-next-line react/display-name
        cell: ({ hash, title, url }: HashArray) => {
          return title ? (
            <>
              <Text title={title}>{title}</Text>
              <ButtonCopy value={hash} />
              {url && <ExternalLink href={url} />}
            </>
          ) : (
            <Hash
              externalLink
              {...(url && { href: `${url}` })}
              onClick={() => {
                if (typeof callbackOnHistoryPush === 'function') callbackOnHistoryPush()
              }}
              value={hash}
            />
          )
        },
        name: titleTable,
      },
    ]
  }, [callbackOnHistoryPush, titleTable])

  return (
    <DataTable
      className={`outerTableWrapper condensedTable ${className}`}
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
