import { ApolloProvider } from '@apollo/react-hooks'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { from, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import apolloLogger from 'apollo-link-logger'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import React from 'react'

import {
  CTE_GRAPH_HTTP_MAINNET,
  CTE_GRAPH_HTTP_RINKEBY,
  CTE_GRAPH_WS_MAINNET,
  CTE_GRAPH_WS_RINKEBY,
  DEFAULT_NETWORK_ID,
  OMEN_GRAPH_HTTP_MAINNET,
  OMEN_GRAPH_HTTP_RINKEBY,
  OMEN_GRAPH_WS_MAINNET,
  OMEN_GRAPH_WS_RINKEBY,
} from 'config/constants'
import { Web3ContextStatus, useWeb3Context } from 'contexts/Web3Context'
import { NetworkId } from 'util/types'

interface Props {
  children: JSX.Element
}

export const ApolloProviderWrapper = ({ children }: Props) => {
  const { status } = useWeb3Context()

  const OmenLink = React.useMemo(() => {
    let httpUri = OMEN_GRAPH_HTTP_MAINNET
    let wsUri = OMEN_GRAPH_WS_MAINNET

    if (DEFAULT_NETWORK_ID === (4 as NetworkId)) {
      httpUri = OMEN_GRAPH_HTTP_RINKEBY
      wsUri = OMEN_GRAPH_WS_RINKEBY
    }

    if (status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      ;({ httpUri, wsUri } = networkConfig.getGraphUris())
    }

    const OmenWsLink = new WebSocketLink({
      uri: wsUri,
      options: {
        reconnect: true,
      },
    })

    const OmenHttpLink = new HttpLink({
      uri: httpUri,
    })

    return split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
      },
      OmenWsLink,
      OmenHttpLink
    )
  }, [status])

  const CTELink = React.useMemo(() => {
    let httpUri = CTE_GRAPH_HTTP_MAINNET
    let wsUri = CTE_GRAPH_WS_MAINNET

    if (DEFAULT_NETWORK_ID === (4 as NetworkId)) {
      httpUri = CTE_GRAPH_HTTP_RINKEBY
      wsUri = CTE_GRAPH_WS_RINKEBY
    }

    if (status._type === Web3ContextStatus.Connected) {
      const { networkConfig } = status
      ;({ httpUri, wsUri } = networkConfig.getGraphUris())
    }

    const CTEWsLink = new WebSocketLink({
      uri: wsUri,
      options: {
        reconnect: true,
      },
    })

    const CTEHttpLink = new HttpLink({
      uri: httpUri,
    })

    return split(
      ({ query }) => {
        const definition = getMainDefinition(query)
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
      },
      CTEWsLink,
      CTEHttpLink
    )
  }, [status])

  const client = new ApolloClient({
    link: from([
      apolloLogger,
      split((operation) => operation.getContext().clientName === 'Omen', OmenLink, CTELink),
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
      },
      query: {
        fetchPolicy: 'no-cache',
      },
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
