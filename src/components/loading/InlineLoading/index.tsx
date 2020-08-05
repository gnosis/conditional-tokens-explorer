import React, { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

import { Spinner } from '../Spinner'
import { Text } from '../common'

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
  message?: string
}

export const InlineLoading: React.FC<Props> = (props: Props) => {
  const { message, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      <Spinner />
      {message ? <Message>{message}</Message> : null}
    </Wrapper>
  )
}
