import styled from 'styled-components'

export const CompactFiltersLayout = styled.div`
  column-gap: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 36px;
  row-gap: 20px;

  .dateFilterRows {
    column-gap: 10px;
    display: grid;
    grid-template-columns: 110px 1fr;

    .dateFilterRow {
      margin: 0;

      &:first-child {
        display: block;
      }

      input[type='date'] {
        &::-webkit-inner-spin-button,
        &::-webkit-calendar-picker-indicator {
          background: transparent;
          color: transparent;
          height: 30px;
          left: 0;
          margin: 0;
          padding: 0;
          position: absolute;
          top: 0;
          width: 110px;
          z-index: 5;
        }
      }
    }
  }
`
