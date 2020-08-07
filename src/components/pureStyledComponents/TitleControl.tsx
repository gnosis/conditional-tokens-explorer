import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

const TitleControlCSS = css`
  color: ${(props) => props.theme.colors.darkerGray};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  text-align: right;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`
export const TitleControl = styled.span`
  ${TitleControlCSS}
`

export const TitleControlA = styled.a`
  ${TitleControlCSS}
`

export const TitleControlNavLink = styled(NavLink)`
  ${TitleControlCSS}
`
