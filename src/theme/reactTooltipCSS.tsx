import { css } from 'styled-components'

export const reactTooltipCSS = css`
  .__react_component_tooltip.show.outcomeTooltip {
    margin-left: -6px;
  }
  .__react_component_tooltip.show.customTooltip {
    border-radius: 4px;
    background-color: ${(props) => props.theme.colors.darkerGray};
    color: #fff;
    font-size: 12px;
    line-height: 1.3;
    max-width: 180px;
    opacity: 1;
    padding: 12px;
    text-align: left;

    > a {
      color: #fff;
      text-decoration: underline;
    }
    > a:hover {
      color: #fff;
    }

    &.place-left:after {
      border-left-color: #000;
    }

    &.place-right:after {
      border-right-color: #000;
    }

    &.place-top:after {
      border-top-color: #000;
    }

    &.place-bottom:after {
      border-bottom-color: #000;
    }

    .multi-line {
      text-align: left;
    }

    &.__react_component_tooltip.type-dark.place-top:after {
      border-top-color: ${(props) => props.theme.colors.darkerGray};
      border-top-width: 10px;
      bottom: -8px;
    }
  }
`
