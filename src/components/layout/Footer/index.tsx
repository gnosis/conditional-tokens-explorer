import React from 'react'
import { NavLink } from 'react-router-dom'
import styled, { css } from 'styled-components'

// eslint-disable-next-line no-restricted-imports
import { version as appVersion } from '../../../../package.json'

const Wrapper = styled.footer`
  &.siteFooter {
    align-items: initial;
    border-radius: 0;
    display: block;
    height: auto;
    margin-top: auto;
    overflow: visible;
    padding: 25px 0;
    width: 100%;
  }
`

const Items = styled.ul`
  &.footerItems {
    align-items: center;
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding-bottom: 0;
    padding-left: ${(props) => props.theme.layout.horizontalPadding};
    padding-right: ${(props) => props.theme.layout.horizontalPadding};
    padding-top: 0;

    @media (min-width: ${(props) => props.theme.themeBreakPoints.mdPre}) {
      flex-direction: row;
      justify-content: center;
    }
  }
`

const Item = styled.li`
  color: ${(props) => props.theme.colors.textColor};

  &:last-child {
    .break {
      display: none;
    }
  }
`

const LinkCSS = css`
  color: ${(props) => props.theme.colors.textColor};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

const ExternalLink = styled.a`
  ${LinkCSS}
`

const FooterLink = styled(NavLink)`
  ${LinkCSS}
`

const Break = styled.span`
  @media (min-width: ${(props) => props.theme.themeBreakPoints.mdPre}) {
    margin: 0 6px;

    &:after {
      content: '|';
    }
  }
`

const Text = styled.span``

export const Footer: React.FC = (props) => {
  const date = new Date()
  const year = date.getFullYear()
  const version = appVersion || 'Invalid Version Number'

  const items = [
    {
      externalLink: true,
      text: `©${year} Gnosis`,
      url: 'https://gnosis.io/',
    },
    {
      text: 'Terms & Conditions',
      url: '/terms-and-conditions',
    },
    {
      text: 'Privacy Policy',
      url: '/privacy-policy',
    },
    {
      text: 'Cookie Policy',
      url: '/cookie-policy',
    },
    {
      externalLink: true,
      text: `Documentation`,
      url: 'https://docs.gnosis.io/conditionaltokens/',
    },
    {
      externalLink: true,
      text: `v${version}`,
      url: 'https://github.com/gnosis/conditional-tokens-explorer/',
    },
  ]

  return (
    <Wrapper className="siteFooter" {...props}>
      <Items className="footerItems">
        {items.map((item, index) => {
          return (
            <Item key={index}>
              {item.url ? (
                item.externalLink ? (
                  <ExternalLink href={item.url} rel="noopener noreferrer" target="_blank">
                    {item.text}
                  </ExternalLink>
                ) : (
                  <FooterLink to={item.url}>{item.text}</FooterLink>
                )
              ) : (
                <Text>{item.text}</Text>
              )}
              <Break className="break" />
            </Item>
          )
        })}
      </Items>
    </Wrapper>
  )
}
