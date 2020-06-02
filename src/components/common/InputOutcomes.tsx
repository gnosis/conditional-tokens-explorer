import React, { ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'

const MIN_OUTCOMES = 2
const MAX_OUTCOMES = 256

const maxOutcomesError = 'Too many outcome slots'
const minOutcomesError = 'There should be more than one outcome slot'

interface Props {
  callback: (n: number) => void
}

export const InputOutcomes = ({ callback }: Props) => {
  const { register, errors, reset } = useForm({ mode: 'onChange' })

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    callback(value)
  }

  return (
    <>
      <input
        name="outcomesNumber"
        onChange={onChange}
        type="number"
        ref={register({ required: true, min: MIN_OUTCOMES, max: MAX_OUTCOMES })}
      ></input>
      <button onClick={() => reset({ outcomesNumber: 40 })}>Max</button>
      <div>
        {errors.outcomesNumber?.type === 'max' && maxOutcomesError}
        {errors.outcomesNumber?.type === 'min' && minOutcomesError}
        {errors.outcomesNumber?.type === 'required' && 'Required field'}
      </div>
    </>
  )
}
