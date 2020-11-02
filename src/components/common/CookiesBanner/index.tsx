import React, { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CloseIcon } from 'components/icons/CloseIcon'
import { GOOGLE_ANALYTICS_ID } from 'config/constants'
import GoogleAnalytics from 'react-ga'
import { getLogger } from 'util/logger'

const logger = getLogger('Analytics::Google')

const Wrapper = styled.div`
  background-color: #fff;
  bottom: 0;
  box-shadow: 0 -5px 8px 0 rgba(212, 213, 211, 0.4);
  display: flex;
  justify-content: center;
  left: 0;
  min-height: 160px;
  padding: 20px;
  position: fixed;
  width: 100%;
  z-index: 123;
`

const Content = styled.div`
  max-width: 100%;
  position: relative;
  width: ${(props) => props.theme.layout.maxWidth};
`

const Text = styled.p`
  color: ${(props) => props.theme.colors.darkerGrey};
  font-size: 17px;
  font-weight: normal;
  line-height: 1.4;
  margin: 0 auto 20px;
  max-width: 100%;
  padding: 0 20px;
  position: relative;
  text-align: center;
  width: 840px;
  z-index: 1;
`

const Link = styled(NavLink)`
  color: ${(props) => props.theme.colors.darkerGrey};
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

const ButtonContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
`

const ButtonAccept = styled(Button)`
  &.buttonAccept {
    bottom: auto;
    font-size: 18px;
    height: 36px;
    left: auto;
    max-width: 170px;
    position: relative;
    right: auto;
    top: auto;
  }
`

const ButtonClose = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  outline: none;
  padding: 0;
  position: absolute;
  right: 0;
  top: 0;
  transition: all 0.15s linear;
  z-index: 5;

  &:hover {
    opacity: 0.5;
  }
`

enum AnalyticsStates {
  accepted = 'accepted',
  notaccepted = 'notaccepted',
}

export const CookiesBanner = () => {
  const location = useLocation()
  const [hideCookiesWarning, setHideCookiesWarning] = useState(false)

  const storage = window.localStorage
  const loadAnalyticsKey = 'loadAnalytics'

  const [loadAnalytics, setLoadAnalytics] = useState<string>(
    storage.getItem(loadAnalyticsKey) === null ||
      storage.getItem(loadAnalyticsKey) === AnalyticsStates.notaccepted
      ? AnalyticsStates.notaccepted
      : AnalyticsStates.accepted
  )

  const loadGoogleAnalytics = useCallback(() => {
    if (!GOOGLE_ANALYTICS_ID) {
      logger.error(
        '[GoogleAnalytics] - In order to use Google analytics you need to add a trackingID using REACT_APP_GOOGLE_ANALYTICS_ID'
      )
      return
    }

    logger.log('Loading Google Analytics...')

    GoogleAnalytics.initialize(GOOGLE_ANALYTICS_ID, { gaOptions: { cookieDomain: 'auto' } })
    GoogleAnalytics.set({ anonymizeIp: true })
    GoogleAnalytics.set({ page: location.pathname })
    GoogleAnalytics.pageview(location.pathname)
  }, [location])

  const acceptCookies = useCallback(() => {
    setLoadAnalytics(AnalyticsStates.accepted)
    storage.setItem(loadAnalyticsKey, AnalyticsStates.accepted)
  }, [storage])

  useEffect(() => {
    if (loadAnalytics === AnalyticsStates.accepted) {
      loadGoogleAnalytics()
    }
  }, [loadAnalytics, loadGoogleAnalytics])

  return hideCookiesWarning || GOOGLE_ANALYTICS_ID === null ? null : loadAnalytics ===
    AnalyticsStates.notaccepted ? (
    <Wrapper>
      <Content>
        <Text>
          We use cookies to give you the best experience and to help improve our website. Please
          read our <Link to={'/cookie-policy'}>Cookie Policy</Link> for more information. By
          clicking <strong>&quot;Accept Cookies&quot;</strong>, you agree to the storing of cookies
          on your device to enhance site navigation, analyze site usage and provide customer
          support.
        </Text>
        <ButtonContainer>
          <ButtonAccept
            buttonType={ButtonType.primaryInverted}
            className="buttonAccept"
            onClick={acceptCookies}
          >
            Accept Cookies
          </ButtonAccept>
        </ButtonContainer>
        <ButtonClose
          onClick={() => {
            setHideCookiesWarning(true)
          }}
        >
          <CloseIcon />
        </ButtonClose>
      </Content>
    </Wrapper>
  ) : null
}
