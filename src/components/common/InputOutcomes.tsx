import React, { ChangeEvent } from 'react'

const MIN_OUTCOMES = 2
const MAX_OUTCOMES = 256

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

interface Props {
  name: string
  callback: (n: number) => void
  errors: any
  register: any
}

export const InputOutcomes = ({ callback, register, errors, name }: Props) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    callback(value)
  }

  return (
    <>
      <input
        name={name}
        onChange={onChange}
        type="number"
        ref={register({ required: true, min: MIN_OUTCOMES, max: MAX_OUTCOMES })}
      ></input>
      {errors && (
        <div>
          {errors.type === 'max' && maxOutcomesError}
          {errors.type === 'min' && minOutcomesError}
          {errors.type === 'required' && 'Required field'}
        </div>
      )}
    </>
  )
}
