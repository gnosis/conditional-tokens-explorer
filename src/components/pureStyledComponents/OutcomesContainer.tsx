import styled from 'styled-components'

export const OutcomesContainer = styled.div<{
  columnGap?: string
  columns?: string
  rowGap?: string
}>`
  align-items: center;
  column-gap: ${(props) => props.columnGap};
  display: grid;
  grid-template-columns: repeat(${(props) => props.columns}, 1fr);
  row-gap: ${(props) => props.rowGap};
`

OutcomesContainer.defaultProps = {
  columns: '10',
  columnGap: '10px',
  rowGap: '10px',
}
