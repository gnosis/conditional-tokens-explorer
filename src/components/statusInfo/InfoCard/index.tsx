import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { ErrorIcon } from 'components/icons/ErrorIcon'
import { WarningIcon } from 'components/icons/WarningIcon'
import { Card, Icon, IconTypes, Text, Title } from 'components/statusInfo/common'

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
        {icon === IconTypes.alert && <WarningIcon />}
        {icon === IconTypes.error && <ErrorIcon />}
      </Icon>
      {message && <Text>{message}</Text>}
    </Wrapper>
  )
}
