import RealitioQuestionLib from '@realitio/realitio-lib/formatters/question'
import RealitioTemplateLib from '@realitio/realitio-lib/formatters/template'
import { Contract, ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'

import { NetworkConfig, getEarliestBlockToCheck } from '../config/networkConfig'
import { getLogger } from '../util/logger'
import { Question, QuestionLog } from '../util/types'

const logger = getLogger('Realitio Service')

const realitioAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public payable returns (bytes32)',
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)',
  'function isFinalized(bytes32 question_id) view public returns (bool)',
  'function resultFor(bytes32 question_id) external view returns (bytes32)',
]

export class RealitioService {
  private contract: Contract
  private provider: ethers.providers.Provider

  constructor(
    private networkConfig: NetworkConfig,
    private providerContext: ethers.providers.Provider,
    private signer?: ethers.Signer
  ) {
    const contractAddress = networkConfig.getRealitioAddress()

    if (signer) {
      this.contract = new ethers.Contract(contractAddress, realitioAbi, providerContext).connect(
        signer
      )
    } else {
      this.contract = new ethers.Contract(contractAddress, realitioAbi, providerContext)
    }
    this.provider = providerContext
  }

  get address(): string {
    return this.contract.address
  }

  async getQuestion(questionId: string): Promise<Question> {
    const filter = this.contract.filters.LogNewQuestion(questionId)
    const network = await this.provider.getNetwork()
    const networkId = network.chainId

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: getEarliestBlockToCheck(networkId),
      toBlock: 'latest',
    })

    if (logs.length === 0) {
      throw new Error(`No LogNewQuestion event found for questionId '${questionId}'`)
    }
    if (logs.length > 1) {
      logger.info(`There should be only one LogNewQuestion event for questionId '${questionId}'`)
    }

    const iface = new ethers.utils.Interface(realitioAbi)
    const event = iface.parseLog(logs[0])

    const { arbitrator, opening_ts: openingTs, question } = event.values
    const templateId = event.values.template_id.toNumber()

    const isNuancedBinary = templateId === 5 || templateId === 6

    const nuancedBinaryTemplate = JSON.stringify({
      title: '%s',
      type: 'single-select',
      outcomes: ['No', 'Mostly No', 'Undecided', 'Mostly Yes', 'Yes'],
      category: '%s',
      lang: '%s',
    })

    const templates = ['bool', 'uint', 'single-select', 'multiple-select', 'datetime']

    const templateType = templates[templateId]
    const template = isNuancedBinary
      ? nuancedBinaryTemplate
      : RealitioTemplateLib.defaultTemplateForType(templateType)
    const questionLog: QuestionLog = RealitioQuestionLib.populatedJSONForTemplate(
      template,
      question
    )

    const { category, title } = questionLog

    const outcomes = isNuancedBinary || !questionLog.outcomes ? ['No', 'Yes'] : questionLog.outcomes

    return {
      id: questionId,
      title: title === 'undefined' ? '' : title,
      category: category === 'undefined' ? '' : category,
      resolution: new Date(openingTs * 1000),
      arbitratorAddress: arbitrator,
      outcomes: outcomes,
      templateId,
      raw: question,
    }
  }

  async isFinalized(questionId: string): Promise<boolean> {
    try {
      const isFinalized = await this.contract.isFinalized(questionId)
      return isFinalized
    } catch (err) {
      console.error(
        `There was an error querying if the question with id '${questionId}' is finalized`,
        err.message
      )
      throw err
    }
  }

  async getWinnerOutcome(questionId: string): Promise<number> {
    const result: string = await this.getResultFor(questionId)
    const resultBN = bigNumberify(result)
    return +resultBN.toString()
  }

  async getResultFor(questionId: string): Promise<string> {
    try {
      const result: string = await this.contract.resultFor(questionId)
      return result
    } catch (err) {
      console.error(
        `There was an error querying the result for question with id '${questionId}'`,
        err.message
      )
      throw err
    }
  }
}
