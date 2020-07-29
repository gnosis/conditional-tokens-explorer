import styled from 'styled-components'

export const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
`

export const MainScroll = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: auto;
  padding-top: 36px;
`

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: 100%;
  padding-left: ${(props) => props.theme.layout.horizontalPadding};
  padding-right: ${(props) => props.theme.layout.horizontalPadding};
  width: ${(props) => props.theme.layout.maxWidth};
`
