import React from 'react'
import styled from 'styled-components'

import { ExternalLinkIcon } from 'components/icons/ExternalLinkIcon'

const Wrapper = styled.a`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: 8px;
  text-decoration: none;
`

interface Props {
  href: string
}

export const ExternalLink: React.FC<Props> = (props) => {
  const { href } = props

  return (
    <Wrapper href={href} target="_blank">
      <ExternalLinkIcon />
    </Wrapper>
  )
}
