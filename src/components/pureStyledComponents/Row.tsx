import styled from 'styled-components'

export const Row = styled.div<{ cols?: string; marginBottomXL?: boolean }>`
  display: grid;
  grid-column-gap: 25px;
  grid-row-gap: 20px;
  grid-template-columns: 1fr;
  margin-bottom: ${(props) => (props.marginBottomXL ? '25px' : '20px')};

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    grid-template-columns: ${(props) => props.cols};
  }
`

Row.defaultProps = {
  cols: '1fr',
  marginBottomXL: false,
}
