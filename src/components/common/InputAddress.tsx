import React, { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'

interface Props {
  callback: (n: string) => void
}

const addressRegex = /^0x[a-fA-F0-9]{40}$/

export const InputAddress = ({ callback }: Props) => {
  const { register, errors } = useForm({ mode: 'onChange' })

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
        ref={register({ required: true, pattern: addressRegex })}
      ></input>
      <div>{errors.address?.type === 'pattern' && 'Invalid address'}</div>
    </>
  )
}
