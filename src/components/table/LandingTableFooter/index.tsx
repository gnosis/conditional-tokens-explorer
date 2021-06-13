import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'

const FooterWrapper = styled.div`
  display: grid;
  place-items: center;
  padding: 15px 18px;
`
interface Props {
  title?: string
}
export const LandingTableFooter: React.FC<Props> = (props) => {
  const { title = 'View All Conditions' } = props
  return (
    <FooterWrapper>
      <Button style={{ width: '100%' }}>{title}</Button>
    </FooterWrapper>
  )
}
