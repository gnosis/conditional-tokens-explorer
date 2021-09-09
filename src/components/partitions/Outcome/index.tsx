import React from 'react'
import styled, { css, withTheme } from 'styled-components'

import ReactTooltip from 'react-tooltip'
import { OutcomeProps } from 'util/types'

const hideHorizontalLineCSS = css`
  .outcomeHorizontalLine {
    display: none;
  }
`

export const Wrapper = styled.div<{ lastInRow?: string }>`
  align-items: center;
  display: flex;
  position: relative;

  &:nth-child(${(props) => props.lastInRow && `${props.lastInRow}n`}),
  &:last-child {
    ${hideHorizontalLineCSS}
  }

  &:nth-child(${(props) =>
        props.lastInRow && `+${parseInt(props.lastInRow)}n+${parseInt(props.lastInRow) + 1}`}) {
    .outcomeVerticalLine {
      display: block;
    }
  }
`

export const OutcomeCircle = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.colors.darkerGrey};
  border-radius: 50%;
  border: 2px solid ${(props) => props.theme.colors.darkerGrey};
  color: #fff;
  display: flex;
  font-size: 13px;
  font-weight: 600;
  height: ${(props) => props.theme.outcomes.dimensions};
  justify-content: center;
  letter-spacing: -0.6px;
  line-height: 1;
  position: relative;
  user-select: none;
  width: ${(props) => props.theme.outcomes.dimensions};
  white-space: nowrap;
`

const OutcomeNumber = styled.span`
  position: relative;
  top: 1px;
`

const OutcomeHorizontalLine = styled.div`
  background-color: ${(props) => props.theme.colors.darkerGrey};
  flex-grow: 1;
  flex-shrink: 1;
  height: 2px;
  width: 10px;
`

const OutcomeVerticalLine = styled.div`
  background-color: ${(props) => props.theme.colors.darkerGrey};
  display: none;
  height: 10px;
  left: 50%;
  position: absolute;
  top: -12px;
  transform: translateX(-50%);
  width: 2px;
`

interface Props {
  disableTooltip?: boolean
  id?: string
  lastInRow?: string
  makeDraggable?: boolean
  onClick?: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDragEnd?: (e: any) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDragStart?: (e: any) => void
  outcome: OutcomeProps
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  theme?: any
}

const BaseOutcome: React.FC<Props> = (props) => {
  const {
    disableTooltip,
    id,
    lastInRow,
    makeDraggable,
    onClick,
    onDragEnd,
    onDragStart,
    outcome,
    theme,
    ...restProps
  } = props

  const tooltipInfo = outcome.id
  const outcomeText = outcome.text ? `<div><strong>Value:</strong> ${outcome.text}</div>` : ''
  const tooltipText = `<div><div><strong>Id:</strong> ${outcome.id}</div>${outcomeText}</div>`

  return (
    <Wrapper
      data-for={`tooltip_${outcome.value}`}
      data-html={true}
      data-multiline={true}
      data-tip={tooltipText}
      id={id}
      lastInRow={lastInRow}
      onClick={onClick}
      {...restProps}
    >
      <OutcomeCircle
        className="outcomeCircle"
        draggable={makeDraggable}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
      >
        <OutcomeNumber>{outcome.value}</OutcomeNumber>
        <OutcomeVerticalLine className="outcomeVerticalLine" />
      </OutcomeCircle>
      <OutcomeHorizontalLine className="outcomeHorizontalLine" />
      {/* Note: I'm disabling tooltips this way so it doesn't interferes with
       * dragging / dropping and other user interactions.
       */}
      {!disableTooltip && (
        <ReactTooltip
          arrowColor={theme.colors.darkerGrey}
          backgroundColor={theme.colors.darkerGrey}
          border={false}
          className="customTooltip outcomeTooltip"
          delayHide={100}
          delayShow={1000}
          disable={!tooltipInfo || disableTooltip}
          effect="solid"
          id={`tooltip_${outcome.value}`}
          textColor="#fff"
        />
      )}
    </Wrapper>
  )
}

export const Outcome = withTheme(BaseOutcome)

export const DraggableOutcome = styled(Outcome)`
  cursor: pointer;

  .outcomeCircle {
    transition: all 0.15s ease-out;

    &:hover {
      background-color: ${(props) => props.theme.colors.error};
      border-color: ${(props) => props.theme.colors.error};
      color: #fff;
    }

    &.isDragging {
      background-color: #fff;
      border-color: ${(props) => props.theme.colors.darkerGrey};
      cursor: move;
    }
  }
`

export const PlaceholderOutcome = styled(Outcome)`
  left: -100vw;
  opacity: 1;
  position: absolute;
  top: -100vh;
  z-index: -12345;

  .outcomeCircle {
    background-color: ${(props) => props.theme.colors.primary};
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 1px 1px 4px 0 rgba(0, 0, 0, 0.3);
    color: #fff;
  }

  ${hideHorizontalLineCSS}
`

export const EditableOutcome = styled(Outcome)<{ hoverColor?: string; activeColor?: string }>`
  cursor: pointer;

  .outcomeCircle {
    background-color: #fff;
    border-color: ${(props) => props.theme.colors.mediumGrey};
    border-style: solid;
    border-width: 2px;
    color: ${(props) => props.theme.colors.mediumGrey};
    transition: all 0.15s ease-out;

    &:hover {
      border-color: ${(props) => props.hoverColor};
      color: ${(props) => props.hoverColor};
    }

    ${(props) =>
      props.activeColor &&
      `
        border-color: ${props.activeColor};
        color: ${props.activeColor};
    `}
  }

  ${hideHorizontalLineCSS}
`

EditableOutcome.defaultProps = {
  hoverColor: '#000',
}
