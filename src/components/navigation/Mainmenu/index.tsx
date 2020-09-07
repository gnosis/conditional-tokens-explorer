import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { InnerContainer } from 'components/pureStyledComponents/InnerContainer'

const Wrapper = styled.nav`
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.7);
  display: block;
  flex-shrink: 0;
  height: 36px;
`

const MenuItems = styled(InnerContainer)`
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
`

const Item = styled(NavLink)`
  border-bottom-color: transparent;
  border-bottom-style: solid;
  border-bottom-width: 2px;
  border-top: 2px solid transparent;
  color: ${(props) => props.theme.colors.textColor};
  display: block;
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 36px;
  margin-right: 15px;
  position: relative;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  user-select: none;
  z-index: 1;

  &:last-child {
    margin-right: 0;
  }

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }

  &.active {
    border-bottom-color: ${(props) => props.theme.colors.primary};
    color: ${(props) => props.theme.colors.primary};
  }
`

export const Mainmenu: React.FC = (props) => {
  const items = [
    {
      title: 'Conditions',
      url: '/conditions',
    },
    {
      title: 'Positions',
      url: '/positions',
    },
    {
      title: 'Prepare Condition',
      url: '/prepare',
    },
    {
      title: 'Split Position',
      url: '/split',
    },
    {
      title: 'Merge Positions',
      url: '/merge',
    },
    {
      title: 'Report Payouts',
      url: '/report',
    },
    {
      title: 'Redeem Positions',
      url: '/redeem',
    },
  ]

  return (
    <Wrapper {...props}>
      <MenuItems>
        {items.map((item, index) => {
          return (
            <Item activeClassName="active" key={index} to={item.url}>
              {item.title}
            </Item>
          )
        })}
      </MenuItems>
    </Wrapper>
  )
}
