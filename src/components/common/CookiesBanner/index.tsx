import React, { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { Button } from 'components/buttons/Button'
import { ButtonType } from 'components/buttons/buttonStylingTypes'
import { CloseIcon } from 'components/icons/CloseIcon'
import { Checkbox } from 'components/pureStyledComponents/Checkbox'
import { GOOGLE_ANALYTICS_ID } from 'config/constants'
import GoogleAnalytics from 'react-ga'
import { getLogger } from 'util/logger'

const logger = getLogger('Analytics::Google')

const INNER_WIDTH = '840px'

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
  width: ${INNER_WIDTH};
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

const Labels = styled.div`
  align-items: center;
  display: flex;
`

const Label = styled.div<{ clickable?: boolean }>`
  align-items: center;
  color: ${(props) => props.theme.colors.darkerGrey};
  display: flex;
  font-size: 17px;
  font-weight: normal;
  line-height: 1.4;
  margin: 0 25px 0 0;

  &:last-child {
    margin-right: 80px;
  }

  ${(props) => props.clickable && 'cursor: pointer'}
`

Label.defaultProps = {
  clickable: false,
}

const CheckboxStyled = styled(Checkbox)`
  margin: 0 10px 0 0;
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

const VISIBLE_COOKIES_BANNER = 'VISIBLE_COOKIES_BANNER'
const COOKIES_FALSE = 'false'
const ACCEPT_GOOGLE_ANALYTICS = 'ACCEPT_GOOGLE_ANALYTICS'

interface Props {
  isBannerVisible: boolean
  onHide: () => void
}

export const CookiesBanner: React.FC<Props> = (props) => {
  const { isBannerVisible, onHide } = props
  const storage = window.localStorage

  const isCookiesBannerVisible = useCallback(() => {
    if (storage.getItem(VISIBLE_COOKIES_BANNER) === COOKIES_FALSE) {
      return false
    } else {
      return true
    }
  }, [storage])

  const location = useLocation()
  const [cookiesWarningVisible, setCookiesWarningVisible] = useState(isCookiesBannerVisible())

  const showCookiesWarning = useCallback(() => {
    setCookiesWarningVisible(true)
    storage.setItem(VISIBLE_COOKIES_BANNER, '')
  }, [storage])

  const hideCookiesWarning = useCallback(() => {
    setCookiesWarningVisible(false)
    storage.setItem(VISIBLE_COOKIES_BANNER, COOKIES_FALSE)
    onHide()
  }, [onHide, storage])

  const isGoogleAnalyticsAccepted = useCallback(() => {
    if (storage.getItem(ACCEPT_GOOGLE_ANALYTICS) === ACCEPT_GOOGLE_ANALYTICS) {
      return true
    } else {
      return false
    }
  }, [storage])

  const [googleAnalyticsAccepted, setGoogleAnalyticsAccepted] = useState(
    isGoogleAnalyticsAccepted()
  )

  const acceptGoogleAnalytics = useCallback(() => {
    setGoogleAnalyticsAccepted(true)
    storage.setItem(ACCEPT_GOOGLE_ANALYTICS, ACCEPT_GOOGLE_ANALYTICS)
  }, [storage])

  const rejectGoogleAnalytics = useCallback(() => {
    setGoogleAnalyticsAccepted(false)
    storage.setItem(ACCEPT_GOOGLE_ANALYTICS, '')
  }, [storage])

  const toggleAcceptGoogleAnalytics = useCallback(() => {
    if (googleAnalyticsAccepted) {
      rejectGoogleAnalytics()
    } else {
      acceptGoogleAnalytics()
    }
  }, [acceptGoogleAnalytics, googleAnalyticsAccepted, rejectGoogleAnalytics])

  const acceptAll = useCallback(() => {
    acceptGoogleAnalytics()
    hideCookiesWarning()
  }, [acceptGoogleAnalytics, hideCookiesWarning])

  const loadGoogleAnalytics = useCallback(() => {
    if (!GOOGLE_ANALYTICS_ID) {
      logger.error(
        'In order to use Google Analytics you need to add a trackingID using the REACT_APP_GOOGLE_ANALYTICS_ID environment variable.'
      )
      return
    }

    logger.log('Loading Google Analytics...')

    GoogleAnalytics.initialize(GOOGLE_ANALYTICS_ID, { gaOptions: { cookieDomain: 'auto' } })
    GoogleAnalytics.set({ anonymizeIp: true })
    GoogleAnalytics.set({ page: location.pathname })
    GoogleAnalytics.pageview(location.pathname)
  }, [location])

  useEffect(() => {
    if (googleAnalyticsAccepted) {
      loadGoogleAnalytics()
    }
    if (isBannerVisible) {
      showCookiesWarning()
    }
  }, [googleAnalyticsAccepted, isBannerVisible, loadGoogleAnalytics, showCookiesWarning])

  return cookiesWarningVisible ? (
    <Wrapper>
      <Content>
        <Text>
          We use cookies to give you the best experience and to help improve our website. Please
          read our <Link to={'/cookie-policy'}>Cookie Policy</Link> for more information. By
          clicking <strong>&quot;Accept All&quot;</strong>, you agree to the storing of cookies on
          your device to enhance site navigation, analyze site usage and provide customer support.
        </Text>
        <ButtonContainer>
          <Labels>
            <Label>
              <CheckboxStyled checked disabled /> Necessary
            </Label>
            <Label clickable onClick={toggleAcceptGoogleAnalytics}>
              <CheckboxStyled checked={googleAnalyticsAccepted} /> Analytics
            </Label>
          </Labels>
          <ButtonAccept
            buttonType={ButtonType.primaryInverted}
            className="buttonAccept"
            onClick={acceptAll}
          >
            Accept All
          </ButtonAccept>
        </ButtonContainer>
        <ButtonClose onClick={hideCookiesWarning}>
          <CloseIcon />
        </ButtonClose>
      </Content>
    </Wrapper>
  ) : null
}
