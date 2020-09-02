import { Token } from 'util/types'

import { CustomCollateralModal } from 'components/form/CustomCollateralModal'
import { SelectPositionModal } from 'components/modals/SelectPositionsModal'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { Position } from 'hooks'
import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { InputPosition, InputPositionProps } from '../../components/form/InputPosition'
import { SelectCollateral, SelectCollateralProps } from '../../components/form/SelectCollateral'
import { TitleControl } from '../../components/pureStyledComponents/TitleControl'

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

const ToggleableSelectCollateral = styled(SelectCollateral)<{ visible?: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`

const ToggleableInputPosition = styled(InputPosition)<{ visible?: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`

interface Props extends InputPositionProps, SelectCollateralProps {}

export const SplitFrom: React.FC<Props> = (props) => {
  const {
    formMethods,
    formMethods: { register, setValue },
    onPositionChange,
    splitFromCollateral,
    splitFromPosition,
    tokens,
  } = props

  const { updatePositionIds } = useMultiPositionsContext()
  const { updateBalances } = useBatchBalanceContext()

  const [showCustomCollateralModal, setShowCustomCollateralModal] = useState(false)
  const [showSelectPositionModal, setShowSelectPositionModal] = useState(false)

  const openCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(true), [])
  const closeCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(false), [])

  const openSelectPositinModal = useCallback(() => setShowSelectPositionModal(true), [])
  const closeSelectPositinModal = useCallback(() => setShowSelectPositionModal(false), [])

  const onSelectPosidionModalConfirm = React.useCallback(
    (positions: Array<Position>) => {
      console.log('onSelectPosidionModalConfirm', positions)
      const ids = positions.map((position) => position.id)
      updatePositionIds(ids)
      updateBalances(ids)
      closeSelectPositinModal()
    },
    [closeSelectPositinModal, updateBalances, updatePositionIds]
  )
  const [customToken, setCustomToken] = useState<Maybe<Token>>(null)

  useEffect(() => {
    if (customToken) {
      setValue('collateral', customToken.address, true)
    }
  }, [customToken, setValue])

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
        <ToggleableTitleControl onClick={openCustomCollateralModal} visible={splitFromCollateral}>
          Add Custom Collateral
        </ToggleableTitleControl>
        <ToggleableTitleControl onClick={openSelectPositinModal} visible={splitFromPosition}>
          Select Position
        </ToggleableTitleControl>
      </Controls>
      <ToggleableSelectCollateral
        formMethods={formMethods}
        splitFromCollateral={splitFromCollateral}
        tokens={customToken ? [...tokens, customToken] : [...tokens]}
        visible={splitFromCollateral}
      />
      <ToggleableInputPosition
        barebones
        formMethods={formMethods}
        onPositionChange={onPositionChange}
        splitFromPosition={splitFromPosition}
        visible={splitFromPosition}
      />
      {showCustomCollateralModal && (
        <CustomCollateralModal onAdd={setCustomToken} onClose={closeCustomCollateralModal} />
      )}
      {showSelectPositionModal && (
        <SelectPositionModal
          isOpen={showSelectPositionModal}
          onConfirm={onSelectPosidionModalConfirm}
          onRequestClose={closeSelectPositinModal}
          preSelectedPositions={[]}
          singlePosition
        />
      )}
    </>
  )
}
