import React from 'react'

import { Error, ErrorContainer } from 'components/pureStyledComponents/Error'
import { Textfield } from 'components/pureStyledComponents/Textfield'
import { TitleValue } from 'components/text/TitleValue'
import { isAddress } from 'util/tools'

interface Props {
  address: string
  onAddressChange: (value: string) => void
}

export const InputAddress = ({ address, onAddressChange }: Props) => {
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    if (address && !isAddress(address)) {
      setError('Address not valid')
    } else {
      setError('')
    }
  }, [address, setError])

  return (
    <>
      <TitleValue
        title={'Address'}
        value={
          <>
            <Textfield
              error={!!error}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const addressValue = e.target.value
                onAddressChange(addressValue)
              }}
              placeholder={'Please enter an address to transfer the outcome tokens...'}
              type="text"
              value={address}
            />

            {!!error && (
              <ErrorContainer>
                <Error>{error}</Error>
              </ErrorContainer>
            )}
          </>
        }
      />
    </>
  )
}
