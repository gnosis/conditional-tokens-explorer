import { IDataTableStyles } from 'react-data-table-component'

import theme from './index'

const horizontalPadding = '15px'

export const customStyles: IDataTableStyles = {
  table: {
    style: {
      flexGrow: 1,
    },
  },
  tableWrapper: {
    style: {
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
    },
  },
  headRow: {
    style: {
      backgroundColor: theme.colors.whitesmoke3,
      borderBottomColor: theme.colors.lightGrey,
      borderBottomWidth: '1px',
      minHeight: '54px',
    },
  },
  headCells: {
    style: {
      color: theme.colors.textColor,
      fontSize: '14px',
      fontWeight: 600,
      lineHeight: '1.2',
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
      textTransform: 'uppercase',
    },
  },
  cells: {
    style: {
      fontSize: '15px',
      fontWeight: 400,
      lineHeight: '1.2',
      paddingLeft: horizontalPadding,
      paddingRight: horizontalPadding,
    },
  },
  rows: {
    style: {
      backgroundColor: theme.cards.backgroundColor,
      borderBottomColor: theme.colors.lightGrey,
      borderBottomStyle: 'solid',
      borderBottomWidth: '1px',
      color: theme.colors.textColor,
      fontSize: '15px',
      minHeight: '47px',
    },
    selectedHighlightStyle: {
      backgroundColor: theme.colors.whitesmoke3,
      borderBottomColor: `${theme.colors.lightGrey}`,
      color: theme.colors.darkerGray,
    },
    highlightOnHoverStyle: {
      color: theme.colors.darkerGray,
      backgroundColor: theme.colors.whitesmoke3,
      transitionDuration: '0.15s',
      transitionProperty: 'background-color',
      borderBottomColor: `${theme.colors.lightGrey}`,
      outlineStyle: 'none',
      outlineWidth: '0',
    },
  },
  pagination: {
    style: {
      backgroundColor: theme.cards.backgroundColor,
      borderTopColor: theme.colors.lightGrey,
      borderTopStyle: 'solid',
      borderTopWidth: '1px',
      color: theme.colors.textColor,
      fontSize: '13px',
      minHeight: '63px',
    },
  },
  noData: {
    style: {
      flexGrow: 1,
    },
  },
}
