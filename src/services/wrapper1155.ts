import { Contract, ethers } from 'ethers'
import { TransactionReceipt } from 'ethers/providers'
import { BigNumber } from 'ethers/utils'

import { CONFIRMATIONS_TO_WAIT } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'

const wrapper1155Abi = [
  'function unwrap(address multiToken,uint256 tokenId,uint256 amount,address recipient,bytes data) external',
  'function batchUnwrap(address multiToken, uint256[] tokenIds, uint256[] amounts, address recipient, bytes data) external',
  'function getWrapped1155(address multiToken, uint256 tokenId)',
]

class Wrapper1155Service {
  private contract: Contract

  constructor(
    private networkConfig: NetworkConfig,
    private provider: ethers.providers.Provider,
    private signer?: ethers.Signer
  ) {
    const contractAddress = networkConfig.getWrapped1155FactoryAddress()
    if (signer) {
      this.contract = new ethers.Contract(contractAddress, wrapper1155Abi, provider).connect(signer)
    } else {
      this.contract = new ethers.Contract(contractAddress, wrapper1155Abi, provider)
    }
  }

  get address(): string {
    return this.contract.address
  }

  async unwrap(
    conditionalTokenAddress: string,
    tokenId: string,
    amount: BigNumber,
    userAddress: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.unwrap(
      conditionalTokenAddress,
      tokenId,
      amount,
      userAddress,
      '0x'
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  async batchUnwrap(
    conditionalTokenAddress: string,
    tokenIds: string[],
    amounts: BigNumber[],
    userAddress: string
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.batchUnwrap(
      conditionalTokenAddress,
      tokenIds,
      amounts,
      userAddress,
      ethers.constants.HashZero
    )
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }

  async getWrapped1155(
    conditionalTokenAddress: string,
    tokenId: string,
  ): Promise<TransactionReceipt> {
    const tx = await this.contract.getWrapped1155(conditionalTokenAddress, tokenId)
    return this.provider.waitForTransaction(tx.hash, CONFIRMATIONS_TO_WAIT)
  }
}

export { Wrapper1155Service }
