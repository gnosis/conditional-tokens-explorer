import { positionString } from 'util/tools'

import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleControl } from 'components/pureStyledComponents/TitleControl'
import { TitleValue } from 'components/text/TitleValue'
import { usePositionContext } from 'contexts/PositionContext'
import { Web3ContextStatus, useWeb3ConnectedOrInfura } from 'contexts/Web3Context'
import { useBalanceForPosition } from 'hooks/useBalanceForPosition'
import React from 'react'
import styled from 'styled-components'

const InfoMessage = styled.p`
  color: ${(props) => props.theme.colors.lightGrey};
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  line-height: 1.4;
  margin: 0 0 5px 0;
  text-align: left;

  &:last-child {
    margin-bottom: 0;
  }
`

export const SelectPosition = () => {
  const { _type: status, connect, networkConfig } = useWeb3ConnectedOrInfura()

  const { errors, loading, position, positionId, setPositionId } = usePositionContext()
  const { balance } = useBalanceForPosition(positionId)

  const [positionToDisplay, setPositionToDisplay] = React.useState<string>('')

  const selectPosition = () => {
    if (status === Web3ContextStatus.Connected) {
      const positionIdFromPrompt = window.prompt(`Enter the position: `)
      if (positionIdFromPrompt) {
        setPositionId(positionIdFromPrompt)
      }
    } else if (status === Web3ContextStatus.Infura) {
      connect()
    }
  }

  React.useEffect(() => {
    if (position) {
      const token = networkConfig.getTokenFromAddress(position.collateralToken.id)

      setPositionToDisplay(
        positionString(position.conditionIds, position.indexSets, balance, token)
      )
    } else {
      setPositionToDisplay('')
    }
  }, [balance, position, status, networkConfig])

  return (
    <TitleValue
      title="Position"
      titleControl={<TitleControl onClick={selectPosition}>Select Position</TitleControl>}
      value={
        <>
          <Textfield
            disabled={true}
            error={!!errors.length}
            placeholder="Please select a position..."
            type="text"
            value={positionToDisplay}
          />
          {loading && (
            <ErrorContainer>
              <InfoMessage>Loading...</InfoMessage>
            </ErrorContainer>
          )}
          {!!errors.length && (
            <ErrorContainer>
              {errors.map((error, i) => (
                <Error key={`error${i}`}>{error}</Error>
              ))}
            </ErrorContainer>
          )}
        </>
      }
    />
  )
}
