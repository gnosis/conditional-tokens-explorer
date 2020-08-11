const darkerGray = '#445055'
const error = '#db3a3d'
const errorDark = '#BC3033'
const lightGrey = '#d4d5d3'
const primary = '#009cb4'
const primaryDark = '#00879B'
const textColor = '#5d6d74'
const whitesmoke1 = '#e8e7e6'
const whitesmoke2 = '#f3f2f2'
const whitesmoke3 = '#fafafa'

const theme = {
  fonts: {
    defaultSize: '14px',
    fontFamily: `'Averta', 'Helvetica Neue', 'Arial', 'Segoe UI', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', '-apple-system', 'BlinkMacSystemFont', sans-serif`,
    fontFamilyCode: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
  },
  border: {
    color: '#eceff1',
    colorDark: lightGrey,
    borderRadius: '6px',
  },
  buttonPrimary: {
    backgroundColor: primary,
    backgroundColorHover: primaryDark,
    borderColor: primary,
    borderColorHover: primaryDark,
    color: '#fff',
    colorHover: '#fff',
  },
  buttonPrimaryInverted: {
    backgroundColor: '#fff',
    backgroundColorHover: primaryDark,
    borderColor: primary,
    borderColorHover: primaryDark,
    color: primary,
    colorHover: '#fff',
  },
  buttonDanger: {
    backgroundColor: error,
    backgroundColorHover: errorDark,
    borderColor: error,
    borderColorHover: errorDark,
    color: '#fff',
    colorHover: '#fff',
  },
  cards: {
    backgroundColor: '#fff',
    borderRadius: '8px ',
    boxShadow: '0 2px 8px 0 rgba(212, 213, 211, 0.7)',
    paddingHorizontal: '20px',
    paddingVertical: '24px',
  },
  colors: {
    darkBlue: '#001428',
    darkGrey: '#5D6D74',
    darkerGray: darkerGray,
    darkestGray: '#081728',
    error: error,
    holdGreen: '#008c73',
    lightGreen: '#a1d2ca',
    lightGrey: lightGrey,
    lighterGreen: '#b6e2da',
    mainBodyBackground: whitesmoke2,
    mediumGrey: '#b2b5b2',
    primary: primary,
    textColor: textColor,
    tomatoRed: error,
    whitesmoke1: whitesmoke1,
    whitesmoke2: whitesmoke2,
    whitesmoke3: whitesmoke3,
  },
  dropdown: {
    item: {
      backgroundColor: 'transparent',
      backgroundColorActive: whitesmoke3,
      backgroundColorHover: whitesmoke3,
      borderColor: lightGrey,
      color: textColor,
      colorActive: darkerGray,
    },
  },
  form: {
    disabled: {
      backgroundColor: '#fff',
      borderColor: '#E8EAF6',
      color: '#757575',
    },
  },
  header: {
    backgroundColor: '#fff',
    height: '60px',
  },
  layout: {
    commonContainerMaxWidth: '600px',
    horizontalPadding: '10px',
    maxWidth: '1272px',
  },
  paddings: {
    mainPadding: '15px',
  },
  pillPrimary: {
    backgroundColor: '#caf2eb',
    color: '#348174',
  },
  pillOpen: {
    backgroundColor: whitesmoke1,
    color: textColor,
  },
  themeBreakPoints: {
    lg: '992px',
    md: '768px',
    sm: '480px',
    xl: '1024px',
    xs: '320px',
    xxl: '1280px',
    xxxl: '1366px',
  },
}

export default theme
