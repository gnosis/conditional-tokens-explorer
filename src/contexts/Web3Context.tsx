import React, { createContext, useState } from 'react'

import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { Web3Provider, JsonRpcSigner } from 'ethers/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { INFURA_ID } from '../config/constants'
import { NetworkConfig } from '../config/networkConfig'
import { ConditionalTokensService } from '../services/conditionalTokens'
type Maybe<T> = T | null

type NotAsked = {
  _type: 'notAsked'
}

type WaitingForUser = {
  _type: 'waitingForUser'
}

type Connected = {
  _type: 'connected'
  provider: Web3Provider
  address: string
  signer: JsonRpcSigner
  networkConfig: NetworkConfig
  CTService: ConditionalTokensService
}

type ConnectedRO = {
  _type: 'connected'
  address: Maybe<string> // TODO
  provider: Web3Provider
  networkConfig: NetworkConfig
}

type ErrorWeb3 = {
  _type: 'error'
  error: Error
}

export type Web3Status = NotAsked | WaitingForUser | Connected | ErrorWeb3
export const Web3Context = createContext(null as Maybe<{ status: Web3Status; connect: () => void }>)

interface Props {
  children: JSX.Element
}

export const Web3ContextProvider = ({ children }: Props) => {
  const [web3Status, setWeb3Status] = useState<Web3Status>({ _type: 'notAsked' })

  const connect = async () => {
    // TODO Check status de si ya esta conectado
    const web3Modal = new Web3Modal({
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: INFURA_ID,
          },
        },
      },
    })

    let web3Provider: Web3Provider
    try {
      web3Provider = await web3Modal.connect()
    } catch (error) {
      setWeb3Status({ _type: 'error', error })
      return
    }

    try {
      const provider = new ethers.providers.Web3Provider(web3Provider)
      const signer = provider.getSigner()

      const networkId = (await provider.getNetwork()).chainId
      if (NetworkConfig.isKnownNetwork(networkId)) {
        const networkConfig = new NetworkConfig(networkId)
        const CTService = new ConditionalTokensService(networkConfig, provider, signer)
        const address = await signer.getAddress()
        setWeb3Status({ _type: 'connected', provider, signer, networkConfig, CTService, address })
      } else {
        setWeb3Status({ _type: 'error', error: new Error('Unknown network') })
      }
    } catch (error) {
      setWeb3Status({ _type: 'error', error })
    }
  }

  return (
    <Web3Context.Provider value={{ status: web3Status, connect }}>{children}</Web3Context.Provider>
  )
}
