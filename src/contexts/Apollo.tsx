import { ApolloProvider } from '@apollo/react-hooks'
import React from 'react'

import { getApolloClient } from 'apolloClientConfig'
import { useWeb3Context } from './Web3Context'
import { NetworkId } from 'config/networkConfig'
import { DEFAULT_NETWORK_ID } from 'config/constants'

interface Props {
  children: JSX.Element
}

export const ApolloProviderWrapper = ({ children }: Props) => {
  const { status } = useWeb3Context()
  const client = React.useMemo(() => {
    let networkId: NetworkId = DEFAULT_NETWORK_ID

    if (status._type === 'connected') {
      networkId = status.networkConfig.networkId
    }

    return getApolloClient(networkId)
  }, [status])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
