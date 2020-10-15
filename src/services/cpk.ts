import { ethers } from 'ethers'

import { NetworkConfig } from 'config/networkConfig'
import CPK from 'contract-proxy-kit/lib/esm'
import EthersAdapter from 'contract-proxy-kit/lib/esm/ethLibAdapters/EthersAdapter'
import { getLogger } from 'util/logger'

const logger = getLogger('Services::CPKService')

class CPKService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cpk: any
  provider: ethers.providers.Provider

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(cpk: any, provider: ethers.providers.Provider) {
    this.cpk = cpk
    this.provider = provider
  }

  static async create(
    networkConfig: NetworkConfig,
    provider: ethers.providers.Provider,
    signer?: ethers.Signer
  ) {
    const cpkAddresses = networkConfig.getCPKAddresses()
    const networks = cpkAddresses
      ? {
          [networkConfig.networkId]: cpkAddresses,
        }
      : {}
    const cpk = await CPK.create({
      ethLibAdapter: new EthersAdapter({
        ethers,
        signer,
      }),
      networks,
    })
    return new CPKService(cpk, provider)
  }

  get address(): string {
    logger.log(`My cpk address is ${this.cpk.address}`)
    return this.cpk.address
  }
}

export { CPKService }
