import React, { DOMAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.div<{ flexDirection?: string }>`
  display: ${(props) => (props.flexDirection === 'column' ? 'flex' : 'block')};
  flex-direction: ${(props) => props.flexDirection};
  margin: 0;
`

Wrapper.defaultProps = {
  flexDirection: 'column',
}

const Title = styled.h2<{ flexDirection?: string }>`
  color: ${(props) => props.theme.colors.darkerGray};
  display: ${(props) => (props.flexDirection === 'column' ? 'block' : 'inline')};
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  margin: ${(props) => (props.flexDirection === 'column' ? '0 0 10px 0' : '0 5px 0 0')};
  text-transform: uppercase;
  white-space: nowrap;
`

const Value = styled.div<{ flexDirection?: string }>`
  color: ${(props) => props.theme.colors.textColorDarker};
  display: ${(props) => (props.flexDirection === 'column' ? 'block' : 'inline')};
  font-size: 16px;
  font-weight: 400;
  line-height: 1.4;
  margin: 0;
  text-transform: capitalize;

  a {
    color: ${(props) => props.theme.colors.textColorDarker};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

interface Props extends DOMAttributes<HTMLDivElement> {
  flexDirection?: string
  title: React.ReactNode
  value: React.ReactNode
}

export const TitleValue: React.FC<Props> = (props: Props) => {
  const { flexDirection, title, value, ...restProps } = props

  return (
    <Wrapper flexDirection={flexDirection} {...restProps}>
      <Title className="title" flexDirection={flexDirection}>
        {title}
      </Title>
      <Value className="value" flexDirection={flexDirection}>
        {value}
      </Value>
    </Wrapper>
  )
}
