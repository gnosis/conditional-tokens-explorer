import React from 'react'
import styled from 'styled-components'

import { ButtonSelect } from 'components/buttons/ButtonSelect'

const Wrapper = styled(ButtonSelect)`
  border-color: ${(props) => props.theme.colors.mediumGrey};
  font-size: 14px;
  height: 32px;
`

interface Props {
  content: React.ReactNode | string
}

export const ButtonSelectLight: React.FC<Props> = (props) => {
  const { content, ...restProps } = props

  return <Wrapper content={content} {...restProps} />
}
