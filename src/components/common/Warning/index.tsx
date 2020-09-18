import React from 'react'
import styled from 'styled-components'

import { AlertIcon } from 'components/icons/AlertIcon'

const Wrapper = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.colors.warning}05;
  border-radius: 4px;
  border: solid 1px ${(props) => props.theme.colors.warning};
  display: flex;
  padding: 8px 10px;
`

const Contents = styled.div`
  margin: 0 0 0 10px;
`

const Title = styled.h2`
  color: ${(props) => props.theme.colors.warning};
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
`

const Description = styled.p`
  color: ${(props) => props.theme.colors.warning};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const AlertIconStyled = styled(AlertIcon)`
  height: 35px;
  width: 35px;
`

interface Props {
  message: string
  title?: string
}

export const Warning: React.FC<Props> = (props) => {
  const { message, title = 'Warning!', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <AlertIconStyled />
      <Contents>
        {title && <Title>{title}</Title>}
        <Description>{message}</Description>
      </Contents>
    </Wrapper>
  )
}
