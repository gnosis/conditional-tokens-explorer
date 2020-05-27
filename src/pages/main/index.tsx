import React, { useEffect, useState } from 'react'
import { useWeb3Context } from '../../hooks/useWeb3Context'

export const Main = () => {
  const { connect, connected, signer } = useWeb3Context()
  const [address, setAddress] = useState(null)

  useEffect(() => {
    const getAddress = async () => {
      const address = await signer.getAddress()
      setAddress(address)
    }
    if (signer) {
      getAddress()
    }
  }, [signer])

  return (
    <>
      {!connected && <button onClick={connect}>Connect</button>}
      {address && <p>{address} </p>}
    </>
  )
}
