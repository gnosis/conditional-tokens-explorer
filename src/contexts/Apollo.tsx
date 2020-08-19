import { ApolloProvider } from '@apollo/react-hooks'
import { getApolloClient } from 'apolloClientConfig'
import { GRAPH_HTTP_MAINNET, GRAPH_WS_MAINNET } from 'config/constants'
import React from 'react'

import { Web3ContextStatus, useWeb3Context } from './Web3Context'

interface Props {
  children: JSX.Element
}

export const ApolloProviderWrapper = ({ children }: Props) => {
  const { status } = useWeb3Context()

  const client = React.useMemo(() => {
    let httpUri = GRAPH_HTTP_MAINNET
    let wsUri = GRAPH_WS_MAINNET

    if (status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      ;({ httpUri, wsUri } = networkConfig.getGraphUris())
    }

    return getApolloClient(httpUri, wsUri)
  }, [status])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
