import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { SelectCollateral } from 'components/form/SelectCollateral'
import { CustomCollateralModal } from 'components/modals/CustomCollateralModal'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { SelectablePositionTable } from 'components/table/SelectablePositionTable'
import { PositionWithUserBalanceWithDecimals } from 'hooks'
import { SplitFromType, Token } from 'util/types'

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

interface Props {
  cleanAllowanceError: () => void
  onPositionChange: (position: PositionWithUserBalanceWithDecimals) => void
  position: Maybe<PositionWithUserBalanceWithDecimals>
  onCollateralChange: (collateral: string) => void
  collateral: Token
  onSplitFromChange: (splitFrom: SplitFromType) => void
  splitFrom: SplitFromType
  tokens: Token[]
}

export const SplitFrom: React.FC<Props> = (props) => {
  const {
    cleanAllowanceError,
    collateral,
    onCollateralChange,
    onPositionChange,
    onSplitFromChange,
    position,
    splitFrom,
    tokens,
  } = props

  const [showCustomCollateralModal, setShowCustomCollateralModal] = useState(false)
  const openCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(true), [])
  const closeCustomCollateralModal = useCallback(() => setShowCustomCollateralModal(false), [])
  const [customToken, setCustomToken] = useState<Maybe<Token>>(null)

  useEffect(() => {
    if (customToken) {
      onCollateralChange(customToken.address)
    }
  }, [customToken, onCollateralChange])

  const onRowClicked = useCallback(
    (row: PositionWithUserBalanceWithDecimals) => {
      onPositionChange(row)
    },
    [onPositionChange]
  )

  return (
    <>
      <Controls>
        <Tabs>
          <Tab>
            <Radio
              name="splitFrom"
              onClick={() => onSplitFromChange(SplitFromType.collateral)}
              type="radio"
              value={SplitFromType.collateral}
            />
            <TabText active={splitFrom === SplitFromType.collateral}>Collateral</TabText>
          </Tab>
          <Break />
          <Tab>
            <Radio
              name="splitFrom"
              onClick={() => onSplitFromChange(SplitFromType.position)}
              type="radio"
              value={SplitFromType.position}
            />
            <TabText active={splitFrom === SplitFromType.position}>Position</TabText>
          </Tab>
        </Tabs>
        <ToggleableTitleControl
          onClick={openCustomCollateralModal}
          visible={splitFrom === SplitFromType.collateral}
        >
          Add Custom Collateral
        </ToggleableTitleControl>
      </Controls>
      <ToggleableSelectCollateral
        cleanAllowanceError={cleanAllowanceError}
        collateral={collateral}
        onCollateralChange={onCollateralChange}
        splitFromCollateral={splitFrom === SplitFromType.collateral}
        tokens={customToken ? [...tokens, customToken] : [...tokens]}
        visible={splitFrom === SplitFromType.collateral}
      />
      <ToggleableSelectablePositionTable
        clearFilters={true}
        hideTitle
        onFilterCallback={(positions: PositionWithUserBalanceWithDecimals[]) =>
          positions.filter(
            (position: PositionWithUserBalanceWithDecimals) => !position.userBalanceERC1155.isZero()
          )
        }
        onRowClicked={onRowClicked}
        selectedPosition={position}
        visible={splitFrom === SplitFromType.position}
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
