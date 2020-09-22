import React, { DOMAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

import { ErrorIcon } from 'components/icons/ErrorIcon'
import { SuccessIcon } from 'components/icons/SuccessIcon'
import { WarningIcon } from 'components/icons/WarningIcon'

const Wrapper = styled.div<{ color: string }>`
  align-items: center;
  background-color: #fff;
  border-radius: 4px;
  border: solid 1px ${(props) => props.color};
  display: flex;
  padding: 8px 10px;
`

const Contents = styled.div`
  margin: 0 0 0 10px;
`

const Title = styled.h2<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
`

const Description = styled.p<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const IconWrapper = styled.div`
  height: 38px;
  width: 38px;

  > svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`

export enum StatusInfoType {
  error = 'Error!',
  warning = 'Warning!',
  success = 'Success!',
}

interface Props extends DOMAttributes<HTMLDivElement> {
  status: StatusInfoType
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any
  title?: string
}

const StatusInfoInlineComponent: React.FC<Props> = (props) => {
  const { children, status, theme, title, ...restProps } = props
  const statusInfoTitle = title ? title : status
  const color =
    status === StatusInfoType.error
      ? theme.colors.error
      : status === StatusInfoType.warning
      ? theme.colors.warning
      : theme.colors.primary

  return (
    <Wrapper color={color} {...restProps}>
      <IconWrapper>
        {status === StatusInfoType.error && <ErrorIcon />}
        {status === StatusInfoType.warning && <WarningIcon />}
        {status === StatusInfoType.success && <SuccessIcon />}
      </IconWrapper>
      <Contents>
        <Title color={color}>{statusInfoTitle}</Title>
        <Description color={color}>{children}</Description>
      </Contents>
    </Wrapper>
  )
}

export const StatusInfoInline = withTheme(StatusInfoInlineComponent)
