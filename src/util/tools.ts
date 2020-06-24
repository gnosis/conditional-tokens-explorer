import { ethers } from 'ethers'
import { Provider } from 'ethers/providers'

export const isAddress = (address: string) => {
  try {
    ethers.utils.getAddress(address)
  } catch (e) {
    return false
  }
  return true
}

export const isContract = async (provider: Provider, address: string): Promise<boolean> => {
  const code = await provider.getCode(address)
  return !!code && code !== '0x'
}

export const range = (max: number): number[] => {
  return Array.from(new Array(max), (_, i) => i)
}
