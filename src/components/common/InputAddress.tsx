import React, { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { ethers } from 'ethers'

// TODO Move to utils?
const isAddress = (address: string) => {
  try {
    ethers.utils.getAddress(address)
  } catch (e) {
    return false
  }
  return true
}

interface Props {
  callback: (n: string) => void
  defaultValue: string
}

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const InputAddress = ({ callback, defaultValue }: Props) => {
  const { register, errors, reset } = useForm({ mode: 'onChange' })

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    callback(value)
  }

  const useDefaultValue = () => {
    reset({ address: defaultValue })
    callback(defaultValue)
  }

  return (
    <>
      <input
        name="address"
        onChange={onChange}
        type="text"
        ref={register({
          required: true,
          pattern: addressRegex,
          validate: (value) => !errors.address || isAddress(value),
        })}
      ></input>
      <button onClick={useDefaultValue}>Use MyWallet</button>
      <div>{errors.address?.type === 'pattern' && 'Invalid address'}</div>
      <div>{errors.address?.type === 'validate' && 'Address checksum failed'}</div>
    </>
  )
}
