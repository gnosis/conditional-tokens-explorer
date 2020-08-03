import styled from 'styled-components'

export const GridTwoColumns = styled.div`
  display: grid;
  grid-column-gap: 25px;
  grid-row-gap: 20px;
  grid-template-columns: 1fr;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    grid-template-columns: 1fr 1fr;
  }
`
