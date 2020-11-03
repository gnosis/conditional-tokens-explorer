import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { InputPositionProps } from 'components/form/InputPosition'
import { SelectCollateral, SelectCollateralProps } from 'components/form/SelectCollateral'
import { CustomCollateralModal } from 'components/modals/CustomCollateralModal'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { PositionWithUserBalanceWithDecimals } from 'hooks'
import { useLocalStorage } from 'hooks/useLocalStorageValue'
import { LocalStorageManagement, SplitFromType, Token } from 'util/types'

const Controls = styled.div`
  margin-bottom: 8px;
  margin-top: -3px;

  @media (min-width: ${(props) => props.theme.themeBreakPoints.md}) {
    align-items: center;
    display: flex;
    justify-content: space-between;
  }
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

const ToggleableSelectablePositionTable = styled(SelectablePositionTable)<{ visible?: boolean }>`
  display: ${(props) => (props.visible ? 'block' : 'none')};
`

interface Props extends InputPositionProps, SelectCollateralProps {}

export const SplitFrom: React.FC<Props> = (props) => {
  const {
    cleanAllowanceError,
    formMethods,
    formMethods: { register, setValue },
    splitFromCollateral,
    splitFromPosition,
    tokens,
  } = props

  const { updatePositionIds } = useMultiPositionsContext()
  const { updateBalances } = useBatchBalanceContext()
  const { getValue } = useLocalStorage(LocalStorageManagement.PositionId)
  const [showCustomCollateralModal, setShowCustomCollateralModal] = useState(false)
  const openCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(true), [])
  const closeCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(false), [])
  const [customToken, setCustomToken] = useState<Maybe<Token>>(null)

  useEffect(() => {
    if (customToken) {
      setValue('collateral', customToken.address, true)
    }
  }, [customToken, setValue])

  useEffect(() => {
    const localStoragePosition = getValue()
    if (localStoragePosition) {
      setValue('splitFrom', SplitFromType.position, false)
      updatePositionIds([localStoragePosition])
      updateBalances([localStoragePosition])
    }
  }, [getValue, updatePositionIds, updateBalances, setValue])

  const [selectedPositionId, setSelectedPositionId] = useState<string | undefined>()
  const onRowClicked = useCallback((row: PositionWithUserBalanceWithDecimals) => {
    setSelectedPositionId(row.id)
  }, [])

  return (
    <>
      <Controls>
        <Tabs>
          <Tab>
            <Radio name="splitFrom" ref={register} type="radio" value={SplitFromType.collateral} />
            <TabText active={splitFromCollateral}>Collateral</TabText>
          </Tab>
          <Break />
          <Tab>
            <Radio name="splitFrom" ref={register} type="radio" value={SplitFromType.position} />
            <TabText active={splitFromPosition}>Position</TabText>
          </Tab>
        </Tabs>
        <ToggleableTitleControl onClick={openCustomCollateralModal} visible={splitFromCollateral}>
          Add Custom Collateral
        </ToggleableTitleControl>
      </Controls>
      <ToggleableSelectCollateral
        cleanAllowanceError={cleanAllowanceError}
        formMethods={formMethods}
        splitFromCollateral={splitFromCollateral}
        tokens={customToken ? [...tokens, customToken] : [...tokens]}
        visible={splitFromCollateral}
      />
      <ToggleableSelectablePositionTable
        onRowClicked={onRowClicked}
        selectedPositionId={selectedPositionId}
        visible={splitFromPosition}
      />
      {showCustomCollateralModal && (
        <CustomCollateralModal
          isOpen={showCustomCollateralModal}
          onAdd={setCustomToken}
          onRequestClose={closeCustomCollateralModal}
        />
      )}
    </>
  )
}
