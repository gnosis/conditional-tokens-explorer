import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { JsonRpcSigner, Web3Provider } from 'ethers/providers'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import Web3Modal from 'web3modal'

import { INFURA_ID } from '../config/constants'
import { NetworkConfig } from '../config/networkConfig'
import { ConditionalTokensService } from '../services/conditionalTokens'
import { RealitioService } from '../services/realitio'

export type NotAsked = {
  _type: 'notAsked'
}

type WaitingForUser = {
  _type: 'waitingForUser'
}

type Connecting = {
  _type: 'connecting'
}

export type Connected = {
  _type: 'connected'
  provider: Web3Provider
  address: string
  signer: JsonRpcSigner
  networkConfig: NetworkConfig
  CTService: ConditionalTokensService
  RtioService: RealitioService
}

type ErrorWeb3 = {
  _type: 'error'
  error: Error
}

export type Web3Status = NotAsked | WaitingForUser | Connecting | Connected | ErrorWeb3
export const Web3Context = createContext(null as Maybe<{ status: Web3Status; connect: () => void }>)

interface Props {
  children: JSX.Element
}

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
})

export const Web3ContextProvider = ({ children }: Props) => {
  const [web3Status, setWeb3Status] = useState<Web3Status>(
    web3Modal.cachedProvider ? { _type: 'connecting' } : { _type: 'notAsked' }
  )

  const connect = useCallback(async () => {
    if (web3Status._type === 'connected') {
      return
    }
    let web3Provider: Web3Provider
    try {
      web3Provider = await web3Modal.connect()
    } catch (error) {
      web3Modal.clearCachedProvider()
      setWeb3Status({ _type: 'error', error } as ErrorWeb3)
      return
    }

    try {
      const provider = new ethers.providers.Web3Provider(web3Provider)
      const signer = provider.getSigner()

      const networkId = (await provider.getNetwork()).chainId
      if (NetworkConfig.isKnownNetwork(networkId)) {
        const networkConfig = new NetworkConfig(networkId)
        const RtioService = new RealitioService(networkConfig, provider, signer)
        const CTService = new ConditionalTokensService(networkConfig, provider, signer)
        const address = await signer.getAddress()
        setWeb3Status({
          _type: 'connected',
          provider,
          signer,
          networkConfig,
          CTService,
          RtioService,
          address,
        } as Connected)
      } else {
        setWeb3Status({ _type: 'error', error: new Error('Unknown network') } as ErrorWeb3)
      }
    } catch (error) {
      setWeb3Status({ _type: 'error', error } as ErrorWeb3)
    }
  }, [web3Status])

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect()
    }
  }, [connect])

  return (
    <Web3Context.Provider value={{ status: web3Status, connect }}>{children}</Web3Context.Provider>
  )
}

export const useWeb3Context = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('[useWeb3Context] Hook not used under web3 context provider')
  }
  return context
}

export const useWeb3Connected = () => {
  const { status } = useWeb3Context()
  if (status._type === 'connected') {
    return status
  }
  throw new Error('[useWeb3Connected] Hook not used under a connected context')
}

export const useWeb3Disconnected = () => {
  const context = useWeb3Context()
  if (context.status._type === 'notAsked') {
    return context
  }
  throw new Error('[useWeb3Disconnected] Hook not used under a disconnected context')
}
