import React, { createContext, useState, useEffect } from 'react'

import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { Web3Provider, JsonRpcSigner } from 'ethers/providers'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { INFURA_ID } from '../config/constants'
type Maybe<T> = T | null

export const Web3Context: any = createContext({})

interface Props {
  children: JSX.Element
}
export const Web3ContextWrapper = ({ children }: Props) => {
  const [web3Provider, setWeb3Provider] = useState<Maybe<Web3Provider>>(null)
  const [provider, setProvider] = useState<Maybe<Web3Provider>>(null)
  const [connected, setConnected] = useState(false)
  const [signer, setSigner] = useState<Maybe<JsonRpcSigner>>(null)

  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
  }

  const web3Modal = new Web3Modal({
    providerOptions,
  })

  const connect = async () => {
    const provider = await web3Modal.connect()
    setWeb3Provider(provider)
  }

  useEffect(() => {
    if (web3Provider) {
      setConnected(true)
      const provider = new ethers.providers.Web3Provider(web3Provider)
      setProvider(provider)

      const signer = provider.getSigner()
      setSigner(signer)
    }
  }, [web3Provider])

  return (
    <Web3Context.Provider value={{ connect, provider, connected, signer }}>
      {children}
    </Web3Context.Provider>
  )
}
