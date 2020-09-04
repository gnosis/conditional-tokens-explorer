import { ApolloProvider } from '@apollo/react-hooks'
import React from 'react'

import { getApolloClient } from 'apolloClientConfig'
import {
  DEFAULT_NETWORK_ID,
  GRAPH_HTTP_MAINNET,
  GRAPH_HTTP_RINKEBY,
  GRAPH_WS_MAINNET,
  GRAPH_WS_RINKEBY,
} from 'config/constants'
import { Web3ContextStatus, useWeb3Context } from 'contexts/Web3Context'
import { NetworkId } from 'util/types'

interface Props {
  children: JSX.Element
}

export const ApolloProviderWrapper = ({ children }: Props) => {
  const { status } = useWeb3Context()

  const client = React.useMemo(() => {
    let httpUri = GRAPH_HTTP_MAINNET
    let wsUri = GRAPH_WS_MAINNET

    if (DEFAULT_NETWORK_ID === (4 as NetworkId)) {
      httpUri = GRAPH_HTTP_RINKEBY
      wsUri = GRAPH_WS_RINKEBY
    }

    if (status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      ;({ httpUri, wsUri } = networkConfig.getGraphUris())
    }

    return getApolloClient(httpUri, wsUri)
  }, [status])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
