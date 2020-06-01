import React, { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  bytes: number
  callback: (n: string) => void
}

export const InputBytes = ({ callback, bytes = 32 }: Props) => {
  const { register, errors } = useForm({ mode: 'onChange' })

  const bytesRegex = RegExp(`^0x[a-fA-F0-9]{${bytes * 2}}$`)
  console.log(bytesRegex)
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    callback(value)
  }

  return (
    <>
      <input
        name="address"
        onChange={onChange}
        type="text"
        ref={register({ required: true, pattern: bytesRegex })}
      ></input>
      <div>{errors.address?.type === 'pattern' && `Invalid bytes${bytes} string`}</div>
    </>
  )
}
