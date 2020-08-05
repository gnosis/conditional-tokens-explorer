import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { BaseCard } from '../../pureStyledComponents/BaseCard'

import { AlertIcon } from './img/AlertIcon'
import { ErrorIcon } from './img/ErrorIcon'

const Wrapper = styled(BaseCard)`
  box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.85);
  flex-direction: column;
  justify-content: space-between;
  margin: auto;
  min-height: 240px;
  width: 280px;
`

const Title = styled.h1`
  color: ${(props) => props.theme.colors.darkBlue};
  font-size: 22px;
  font-weight: 400;
  line-height: 1;
  margin: 0;
  text-align: left;
`

const Text = styled.p`
  color: ${(props) => props.theme.colors.darkGrey};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  text-align: center;
`

const Icon = styled.div`
  align-items: center;
  display: flex;
  flex-grow: 1;
  justify-content: center;
  padding: 30px 0;
`

export enum InfoCardIcon {
  alert = 1,
  error = 2,
}

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon?: InfoCardIcon
  message?: string
  title: string
}

export const InfoCard: React.FC<Props> = (props) => {
  const { icon = InfoCardIcon.error, message, title = 'Error', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      {title && <Title>{title}</Title>}
      <Icon>
        {icon === InfoCardIcon.alert && <AlertIcon />}
        {icon === InfoCardIcon.error && <ErrorIcon />}
      </Icon>
      {message && <Text>{message}</Text>}
    </Wrapper>
  )
}
