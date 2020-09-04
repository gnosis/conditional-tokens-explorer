import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { Spinner } from 'components/statusInfo/Spinner'
import { Text } from 'components/statusInfo/common'

const FlexCSS = css`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: center;
`

const AbsoluteCSS = css`
  left: 0;
  position: absolute;
  top: 0;
  z-index: 100;
`

const Wrapper = styled.div<{ absolute?: boolean }>`
  height: 100%;
  width: 100%;

  ${(props) => (props.absolute ? AbsoluteCSS : '')}
  ${(props) => (!props.absolute ? FlexCSS : '')}
`

Wrapper.defaultProps = {
  absolute: false,
}

const Message = styled(Text)`
  padding: 25px 0;
  width: 100%;
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  absolute?: boolean
  height?: string
  message?: string
  width?: string
}

export const InlineLoading: React.FC<Props> = (props: Props) => {
  const { height, message, width, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Spinner height={height} width={width} />
      {message ? <Message>{message}</Message> : null}
    </Wrapper>
  )
}
