import React from 'react'
import styled from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled.span`
  font-family: 'Roboto Mono', monospace;
  text-transform: uppercase;
`

const Text = styled.span<{ underline?: boolean }>`
  ${(props) => props.underline && 'text-decoration: underline;'}
  ${(props) => props.underline && 'cursor: pointer;'}
`

Text.defaultProps = {
  underline: false,
}

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onClick?: (row: any) => void
  truncateInTheMiddle?: boolean
  underline?: boolean
  value: string
}

export const CellHash: React.FC<Props> = (props) => {
  const { onClick, truncateInTheMiddle = true, underline, value, ...restProps } = props
  const shownValue = truncateInTheMiddle ? truncateStringInTheMiddle(value, 10, 8) : value

  return (
    <Wrapper {...restProps}>
      <Text onClick={onClick} underline={underline}>
        {shownValue}
      </Text>
      <ButtonCopy light value={value} />
    </Wrapper>
  )
}
