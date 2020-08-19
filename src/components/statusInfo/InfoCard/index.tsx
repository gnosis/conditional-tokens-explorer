import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { Card, Icon, IconTypes, Text, Title } from '../common'
import { AlertIcon } from '../icons/AlertIcon'
import { ErrorIcon } from '../icons/ErrorIcon'

const Wrapper = styled(Card)`
  margin: auto;
  min-height: 240px;
  width: 280px;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  icon?: IconTypes
  message?: string
  title: string
}

export const InfoCard: React.FC<Props> = (props) => {
  const { icon = IconTypes.error, message, title = 'Error', ...restProps } = props

  return (
    <Wrapper {...restProps}>
      {title && <Title>{title}</Title>}
      <Icon>
        {icon === IconTypes.alert && <AlertIcon />}
        {icon === IconTypes.error && <ErrorIcon />}
      </Icon>
      {message && <Text>{message}</Text>}
    </Wrapper>
  )
}
