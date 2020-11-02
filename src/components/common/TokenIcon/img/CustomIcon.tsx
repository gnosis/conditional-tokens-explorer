import React from 'react'
import styled from 'styled-components'

const TokenIcon = styled.img`
  max-width: 20px;
  max-height: 20px;
`

interface Props {
  src: string
}

export const CustomIcon = (props: Props) => {
  const { src } = props
  return <TokenIcon src={src} />
}
