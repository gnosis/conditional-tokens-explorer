import React, { ChangeEvent } from 'react'
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
  name: string
  register: any
  errors: any
}

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const InputAddress = ({ name, callback, register, errors }: Props) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    callback(value)
  }

  return (
    <>
      <input
        name={name}
        onChange={onChange}
        type="text"
        ref={register({
          required: true,
          pattern: addressRegex,
          validate: (value: string) => isAddress(value),
        })}
      ></input>
      {errors && (
        <div>
          {errors.type === 'pattern' && 'Invalid address'}
          {errors.type === 'validate' && 'Address checksum failed'}
        </div>
      )}
    </>
  )
}
