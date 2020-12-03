import React from 'react'
import styled, { css } from 'styled-components'

import { ButtonCopy } from 'components/buttons/ButtonCopy'
import { truncateStringInTheMiddle } from 'util/tools'

const Wrapper = styled.span`
  align-items: center;
  display: inline-flex;
  flex-wrap: nowrap;
  white-space: nowrap;
`

const TextCSS = css`
  color: ${(props) => props.theme.colors.textColor};
`

const Text = styled.span`
  ${TextCSS}
`

const ButtonCopyStyled = styled(ButtonCopy)`
  position: relative;
  top: 1px;
`

interface Props {
  onClick?: () => void
  questionTitle: string
  hash: string
}

export const Question: React.FC<Props> = (props) => {
  const { hash, onClick, questionTitle, ...restProps } = props
  const shownValue = truncateStringInTheMiddle(questionTitle, 10, 8)
  return (
    <Wrapper {...restProps}>
      <Text className="hashText" onClick={onClick}>
        {truncateStringInTheMiddle(shownValue, 10, 8)}
      </Text>
      <ButtonCopyStyled light value={hash} />
    </Wrapper>
  )
}
