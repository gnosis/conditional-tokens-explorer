import WalletConnectProvider from '@walletconnect/web3-provider'
import { ethers } from 'ethers'
import { InfuraProvider, JsonRpcSigner, Web3Provider } from 'ethers/providers'
import React from 'react'
import Web3Modal from 'web3modal'

import { DEFAULT_NETWORK_ID, INFURA_ID } from '../config/constants'
import { NetworkConfig } from '../config/networkConfig'
import { ConditionalTokensService } from '../services/conditionalTokens'
import { RealitioService } from '../services/realitio'

export enum Web3ContextStatus {
  NotAsked = 'notAsked',
  WaitingForUser = 'waitingForUser',
  Connecting = 'connecting',
  Error = 'error',
  Connected = 'connected',
  Infura = 'infura',
}

export type NotAsked = {
  _type: Web3ContextStatus.NotAsked
}

type WaitingForUser = {
  _type: Web3ContextStatus.WaitingForUser
}

type Connecting = {
  _type: Web3ContextStatus.Connecting
}

type ErrorWeb3 = {
  _type: Web3ContextStatus.Error
  error: Error
}

export type Connected = {
  _type: Web3ContextStatus.Connected
  provider: Web3Provider
  address: string
  signer: JsonRpcSigner
  networkConfig: NetworkConfig
  CTService: ConditionalTokensService
  RtioService: RealitioService
  disconnect: () => void
}

export type Infura = {
  _type: Web3ContextStatus.Infura
  provider: InfuraProvider
  networkConfig: NetworkConfig
  CTService: ConditionalTokensService
  RtioService: RealitioService
}

export type Web3Status = NotAsked | WaitingForUser | Connecting | Connected | ErrorWeb3 | Infura

export interface ConnectedWeb3Context {
  status: Web3Status
  connect: () => void
  disconnect: () => void
}

export const Web3Context = React.createContext<Maybe<ConnectedWeb3Context>>(null)

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
  const web3StatusDefault: Web3Status = web3Modal.cachedProvider
    ? { _type: Web3ContextStatus.Connecting }
    : { _type: Web3ContextStatus.NotAsked }
  const [web3Status, setWeb3Status] = React.useState<Web3Status>(web3StatusDefault)

  const disconnectWeb3Modal = React.useCallback(async () => {
    if (web3Status._type !== Web3ContextStatus.Connected) {
      return
    }

    try {
      await web3Modal.clearCachedProvider()
      setWeb3Status({ _type: Web3ContextStatus.NotAsked } as Web3Status)
    } catch (error) {
      setWeb3Status({ _type: Web3ContextStatus.Error, error } as ErrorWeb3)
      return
    }
  }, [web3Status])

  const connectWeb3Modal = React.useCallback(async () => {
    if (web3Status._type === Web3ContextStatus.Connected) {
      return
    }
    let web3Provider: Web3Provider
    try {
      web3Provider = await web3Modal.connect()
    } catch (error) {
      web3Modal.clearCachedProvider()
      setWeb3Status({ _type: Web3ContextStatus.Error, error } as ErrorWeb3)
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
          _type: Web3ContextStatus.Connected,
          provider,
          signer,
          networkConfig,
          CTService,
          RtioService,
          address,
        } as Connected)
      } else {
        setWeb3Status({
          _type: Web3ContextStatus.Error,
          error: new Error('Unknown network'),
        } as ErrorWeb3)
      }
    } catch (error) {
      setWeb3Status({ _type: Web3ContextStatus.Error, error } as ErrorWeb3)
    }
  }, [web3Status])

  const connectInfura = React.useCallback(async () => {
    if (web3Status._type === Web3ContextStatus.Infura) {
      return
    }

    try {
      const provider = new ethers.providers.InfuraProvider(DEFAULT_NETWORK_ID, INFURA_ID)

      const networkId = (await provider.getNetwork()).chainId
      if (NetworkConfig.isKnownNetwork(networkId)) {
        const networkConfig = new NetworkConfig(networkId)
        const RtioService = new RealitioService(networkConfig, provider)
        const CTService = new ConditionalTokensService(networkConfig, provider)
        setWeb3Status({
          _type: Web3ContextStatus.Infura,
          provider,
          networkConfig,
          CTService,
          RtioService,
        } as Infura)
      } else {
        setWeb3Status({
          _type: Web3ContextStatus.Error,
          error: new Error('Unknown network'),
        } as ErrorWeb3)
      }
    } catch (error) {
      setWeb3Status({ _type: Web3ContextStatus.Error, error } as ErrorWeb3)
    }
  }, [web3Status])

  React.useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWeb3Modal()
    } else {
      connectInfura()
    }
  }, [connectWeb3Modal, connectInfura])

  return (
    <Web3Context.Provider
      value={{ status: web3Status, connect: connectWeb3Modal, disconnect: disconnectWeb3Modal }}
    >
      {children}
    </Web3Context.Provider>
  )
}

export const useWeb3Context = () => {
  const context = React.useContext(Web3Context)
  if (!context) {
    throw new Error('[useWeb3Context] Hook not used under web3 context provider')
  }
  return context
}

export const useWeb3Connected = () => {
  const { disconnect, status } = useWeb3Context()
  if (status._type === Web3ContextStatus.Connected) {
    return { ...status, disconnect }
  }
  throw new Error('[useWeb3Connected] Hook not used under a connected context')
}

export const useWeb3Disconnected = () => {
  const context = useWeb3Context()
  if (
    context.status._type === Web3ContextStatus.NotAsked ||
    context.status._type === Web3ContextStatus.Infura
  ) {
    return context
  }
  throw new Error('[useWeb3Disconnected] Hook not used under a disconnected context')
}
