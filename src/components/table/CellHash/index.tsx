import React from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { ExternalLinkIcon } from 'components/icons/ExternalLinkIcon'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled.span`
  align-items: center;
  display: flex;
  flex-grow: 1;
  flex-wrap: nowrap;
  font-family: 'Roboto Mono', monospace;
  text-transform: uppercase;
  white-space: nowrap;
`

const Text = styled.span<{ underline?: boolean }>`
  ${(props) => props.underline && 'text-decoration: underline;'}
  ${(props) => props.underline && 'cursor: pointer;'}
`

Text.defaultProps = {
  underline: false,
}

const ExternalLink = styled.a`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: 10px;
  text-decoration: none;
`

interface Props {
  externalLink?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (row: any) => void
  truncateInTheMiddle?: boolean
  underline?: boolean
  value: string
}

export const CellHash: React.FC<Props> = (props) => {
  const {
    externalLink,
    onClick,
    truncateInTheMiddle = true,
    underline,
    value,
    ...restProps
  } = props
  const shownValue = truncateInTheMiddle ? truncateStringInTheMiddle(value, 10, 8) : value

  return (
    <Wrapper {...restProps}>
      <Text onClick={onClick} underline={underline}>
        {shownValue}
      </Text>
      <ButtonCopy light value={value} />
      {externalLink && (
        <ExternalLink href={externalLink} target="_blank">
          <ExternalLinkIcon />
        </ExternalLink>
      )}
    </Wrapper>
  )
}
