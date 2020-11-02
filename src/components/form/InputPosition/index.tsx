import { BigNumber } from 'ethers/utils'
import React, { useCallback, useEffect } from 'react'
import { FormContextValues } from 'react-hook-form'
import styled from 'styled-components'

import { TextfieldFetchableData } from 'components/form/TextfieldFetchableData'
import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { useBatchBalanceContext } from 'contexts/BatchBalanceContext'
import { useMultiPositionsContext } from 'contexts/MultiPositionsContext'
import { useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useWithToken } from 'hooks/useWithToken'
import { SplitPositionFormMethods } from 'pages/SplitPosition/Form'
import { GetMultiPositions_positions } from 'types/generatedGQLForCTE'
import { positionString } from 'util/tools'
import { Errors } from 'util/types'

const Wrapper = styled.div``

const InputWrapper = styled.div`
  position: relative;
`

const isDataInSync = (
  positionsLoading: boolean,
  balancesLoading: boolean,
  positions: GetMultiPositions_positions[],
  balances: BigNumber[]
) => {
  return (
    !positionsLoading &&
    !balancesLoading &&
    positions.length &&
    balances.length &&
    balances.length === positions.length
  )
}

export interface InputPositionProps {
  formMethods: FormContextValues<SplitPositionFormMethods>
  onPositionChange: (position: Maybe<GetMultiPositions_positions>) => void
  splitFromPosition: boolean
  clickHandler?: () => void
}

export const InputPosition = ({
  clickHandler,
  formMethods: { register, setValue },
  onPositionChange,
  splitFromPosition,
  ...restProps
}: InputPositionProps) => {
  const { networkConfig } = useWeb3ConnectedOrInfura()
  const {
    errors: positionsErrors,
    loading: positionsLoading,
    positionIds,
    positions,
  } = useMultiPositionsContext()
  const { data: positionsWithToken } = useWithToken(positions)

  const { balances, errors: balancesErrors, loading: balancesLoading } = useBatchBalanceContext()

  const [positionToDisplay, setPositionToDisplay] = React.useState('')

  const handleClick = useCallback(() => {
    if (clickHandler && typeof clickHandler === 'function') {
      clickHandler()
    }
  }, [clickHandler])

  useEffect(() => {
    register('positionId', { required: splitFromPosition })
  }, [register, splitFromPosition])

  React.useEffect(() => {
    if (positionIds.length > 0) {
      if (isDataInSync(positionsLoading, balancesLoading, positionsWithToken, balances)) {
        setPositionToDisplay(
          positionString(
            positions[0].conditionIds,
            positions[0].indexSets,
            balances[0],
            positionsWithToken[0].token
          )
        )
        onPositionChange(positions[0])
        setValue('positionId', positions[0].id, true)
      }
    } else {
      setPositionToDisplay('')
      onPositionChange(null)
      setValue('positionId', '', true)
    }
  }, [
    balances,
    networkConfig,
    positions,
    positionsLoading,
    balancesLoading,
    positionIds,
    onPositionChange,
    setValue,
    positionsWithToken,
  ])

  const errors = React.useMemo(() => [...positionsErrors, ...balancesErrors], [
    positionsErrors,
    balancesErrors,
  ])

  return (
    <Wrapper {...restProps}>
      <InputWrapper>
        <TextfieldFetchableData
          error={!!errors.length}
          isFetching={balancesLoading}
          onClick={handleClick}
          placeholder={'Please select a position...'}
          readOnly
          type="text"
          value={positionToDisplay}
        />
      </InputWrapper>
      {!!errors && (
        <ErrorContainer>
          {errors.map((error: Errors, index: number) => (
            <Error key={index}>{error}</Error>
          ))}
        </ErrorContainer>
      )}
    </Wrapper>
  )
}
