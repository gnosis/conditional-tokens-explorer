import React, { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

interface ButtonProps {
  theme?: unknown
}

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, ButtonProps {}

const Wrapper = styled.a`
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-align: right;
  text-transform: none;
  text-decoration: underline;
  cursor: pointer;
  color: ${(props) => props.theme.colors.darkerGray};
`

export const ButtonLink: React.FC<ButtonLinkProps> = (props: ButtonLinkProps) => {
  const { children, ...restProps } = props

  return <Wrapper {...restProps}>{children}</Wrapper>
}
