import React from 'react'
import styled from 'styled-components'

import { SelectCollateral, SelectCollateralProps } from '../../components/form/SelectCollateral'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'

import { InputPosition, InputPositionProps } from './InputPosition'

const Controls = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  margin-top: -3px;
`

const Tabs = styled.div`
  display: flex;
  align-items: center;
`

const Tab = styled.div`
  position: relative;
`

const TabText = styled.div<{ active: boolean }>`
  color: ${(props) => (props.active ? props.theme.colors.primary : props.theme.colors.mediumGrey)};
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  position: relative;
  text-align: left;
  text-transform: uppercase;
  z-index: 1;
`

const Radio = styled.input`
  cursor: pointer;
  height: 100%;
  opacity: 0;
  position: absolute;
  width: 100%;
  z-index: 123;
`

const Break = styled.div`
  background-color: ${(props) => props.theme.colors.mediumGrey};
  height: 14px;
  margin: 0 8px;
  width: 1px;
`

const ToggleableTitleControl = styled(TitleControl)<{ visible?: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`

interface Props extends InputPositionProps, SelectCollateralProps {}

export const SplitFrom: React.FC<Props> = (props) => {
  const {
    formMethods,
    formMethods: { register },
    onCollateralChange,
    onPositionChange,
    splitFromCollateral,
    splitFromPosition,
    tokens,
  } = props

  return (
    <>
      <Controls>
        <Tabs>
          <Tab>
            <Radio name="splitFrom" ref={register} type="radio" value="collateral" />
            <TabText active={splitFromCollateral}>Collateral</TabText>
          </Tab>
          <Break />
          <Tab>
            <Radio name="splitFrom" ref={register} type="radio" value="position" />
            <TabText active={splitFromPosition}>Position</TabText>
          </Tab>
        </Tabs>
        <ToggleableTitleControl visible={splitFromCollateral}>
          Add Custom Collateral
        </ToggleableTitleControl>
        <ToggleableTitleControl visible={splitFromPosition}>Select Position</ToggleableTitleControl>
      </Controls>
      <SelectCollateral
        formMethods={formMethods}
        onCollateralChange={onCollateralChange}
        splitFromCollateral={splitFromCollateral}
        tokens={tokens}
      />
      <InputPosition
        formMethods={formMethods}
        onPositionChange={onPositionChange}
        splitFromPosition={splitFromPosition}
      ></InputPosition>
    </>
  )
}
