import React, { ChangeEvent } from 'react'

interface Props {
  name: string
  bytes: number
  callback: (n: string) => void
  register: any
  errors: any
}

export const InputBytes = ({ callback, bytes = 32, register, errors, name }: Props) => {
  const bytesRegex = RegExp(`^0x[a-fA-F0-9]{${bytes * 2}}$`)

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
        ref={register({ required: true, pattern: bytesRegex })}
      ></input>
      {errors && <div>{errors.type === 'pattern' && `Invalid bytes${bytes} string`}</div>}
    </>
  )
}
