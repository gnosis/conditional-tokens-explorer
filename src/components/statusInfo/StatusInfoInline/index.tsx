import React, { DOMAttributes } from 'react'
import styled, { withTheme } from 'styled-components'

import { ErrorIcon } from 'components/icons/ErrorIcon'
import { SuccessIcon } from 'components/icons/SuccessIcon'
import { WarningIcon } from 'components/icons/WarningIcon'
import { Spinner } from 'components/statusInfo/Spinner'
import { SpinnerSize } from 'components/statusInfo/common'

const Wrapper = styled.div<{ color: string }>`
  background-color: #fff;
  border-radius: 4px;
  border: solid 1px ${(props) => props.color};
  color: ${(props) => props.color};
  display: flex;
  font-size: 15px;
  padding: 8px 10px;

  a {
    color: ${(props) => props.color};
  }

  svg .fill {
    fill: ${(props) => props.color};
  }
`

const Contents = styled.div`
  flex-grow: 1;
  margin: auto 0 auto 10px;
`

const Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  margin: 0;
`

const Description = styled.p`
  font-weight: 400;
  line-height: 1.2;
  margin: 0;
`

const IconWrapper = styled.div`
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: 38px;
  width: 38px;

  > svg {
    display: block;
    height: 100%;
    width: 100%;
  }
`

const WorkingSpinner = styled(Spinner)`
  margin-bottom: auto;
  margin-top: auto;
`

export enum StatusInfoType {
  error = 'Error!',
  warning = 'Warning!',
  success = 'Success!',
  working = 'Working...',
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
        {status === StatusInfoType.working && <WorkingSpinner size={SpinnerSize.small} />}
      </IconWrapper>
      <Contents>
        <Title>{statusInfoTitle}</Title>
        {children && <Description>{children}</Description>}
      </Contents>
    </Wrapper>
  )
}

export const StatusInfoInline = withTheme(StatusInfoInlineComponent)
