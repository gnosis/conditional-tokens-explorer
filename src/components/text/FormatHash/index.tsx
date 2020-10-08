import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.span``

const Hash = styled.span`
  text-transform: uppercase;
`

interface Props extends HTMLAttributes<HTMLSpanElement> {
  hash: string
}

export const FormatHash: React.FC<Props> = (props) => {
  const { hash, ...restProps } = props

  const cleanHash = hash.replace(/0x/i, '')

  return (
    <Wrapper {...restProps}>
      0x<Hash>{cleanHash}</Hash>
    </Wrapper>
  )
}
