import styled from 'styled-components'

export const GridTwoColumns = styled.div<{ forceOneColumn?: boolean }>`
  display: grid;
  grid-column-gap: 25px;
  grid-row-gap: 20px;
  grid-template-columns: 1fr;
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    grid-template-columns: ${(props) => (props.forceOneColumn ? '1fr' : '1fr 1fr')};
  }
`

GridTwoColumns.defaultProps = {
  forceOneColumn: false,
}
