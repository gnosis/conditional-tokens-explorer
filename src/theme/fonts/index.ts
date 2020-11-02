import { css } from 'styled-components'

import AvertaBold from 'theme/fonts/Averta-Bold.woff2'
import AvertaRegularItalic from 'theme/fonts/Averta-Regular-Italic.woff2'
import AvertaRegular from 'theme/fonts/Averta-Regular.woff2'
import AvertaSemiboldItalic from 'theme/fonts/Averta-Semibold-Italic.woff2'
import AvertaSemibold from 'theme/fonts/Averta-Semibold.woff2'

export const localFonts = css`
  @font-face {
    font-display: swap;
    font-family: 'Averta';
    font-style: normal;
    font-weight: 400;
    src: local('Averta'), url(${AvertaRegular}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Averta';
    font-style: italic;
    font-weight: 400;
    src: local('Averta Regular Italic'), url(${AvertaRegularItalic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Averta';
    font-style: normal;
    font-weight: 600;
    src: local('Averta Semibold'), url(${AvertaSemibold}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Averta';
    font-style: italic;
    font-weight: 600;
    src: local('Averta Semibold Italic'), url(${AvertaSemiboldItalic}) format('woff2');
  }

  @font-face {
    font-display: swap;
    font-family: 'Averta';
    font-style: normal;
    font-weight: 700;
    src: local('Averta Bold'), url(${AvertaBold}) format('woff2');
  }
`
