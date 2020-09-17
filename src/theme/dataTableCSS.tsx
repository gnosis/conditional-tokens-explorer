import { css } from 'styled-components'

/** Sorry, I have to do this 'cause it's impossible to style this using what's
 * available in "tableCustomStyles". This is kinda ugly, I know.
 * */
export const dataTableCSS = css`
  .outerTableWrapper {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px 0 rgba(212, 213, 211, 0.7);
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    min-height: 400px;

    &.inlineTable {
      border: 1px solid ${(props) => props.theme.colors.lightGrey};
      box-shadow: none;
      margin-bottom: 32px;
      min-height: 170px;

      .rdt_TableHeadRow {
        min-height: 38px;
      }

      .rdt_Pagination {
        max-height: 39px;
        min-height: 39px;
      }
    }

    .rdt_TableCol {
      div {
        white-space: nowrap;
      }
    }

    .rdt_TableRow {
      border-bottom-color: ${(props) => props.theme.colors.lightGrey}!important;

      &:hover {
        color: ${(props) => props.theme.colors.darkerGray}!important;
      }

      &:last-of-type {
        border-bottom: none !important;
      }

      /*
        If item count > 7 three last items' dropdowns grow / show upwards to avoid
        being cut because of overflow hidden...
       */
      &:nth-child(n + 8) {
        .dropdownItems {
          bottom: calc(100% + 10px);
          top: auto;
        }
      }
    }
  }
`
