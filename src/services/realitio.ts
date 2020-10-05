import RealitioQuestionLib from '@realitio/realitio-lib/formatters/question'
import RealitioTemplateLib from '@realitio/realitio-lib/formatters/template'
import { Contract, ethers } from 'ethers'
import { bigNumberify } from 'ethers/utils'

import { REALITIO_TIMEOUT, SINGLE_SELECT_TEMPLATE_ID } from 'config/constants'
import { NetworkConfig } from 'config/networkConfig'
import { getLogger } from 'util/logger'
import { Question, QuestionLog, QuestionOptions } from 'util/types'

const logger = getLogger('Realitio Service')

const realitioAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public payable returns (bytes32)',
  'event LogNewQuestion(bytes32 indexed question_id, address indexed user, uint256 template_id, string question, bytes32 indexed content_hash, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce, uint256 created)',
  'function isFinalized(bytes32 question_id) view public returns (bool)',
  'function resultFor(bytes32 question_id) external view returns (bytes32)',
]

const realitioCallAbi = [
  'function askQuestion(uint256 template_id, string question, address arbitrator, uint32 timeout, uint32 opening_ts, uint256 nonce) public constant returns (bytes32)',
]

export class RealitioService {
  private contract: Contract
  private constantContract: Contract
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
    this.constantContract = new ethers.Contract(contractAddress, realitioCallAbi, providerContext)
    this.provider = providerContext
  }

  get address(): string {
    return this.contract.address
  }

  askQuestion = async (questionOptions: QuestionOptions): Promise<string> => {
    const {
      arbitratorAddress,
      category,
      networkConfig,
      openingDateMoment,
      outcomes,
      question,
      signerAddress,
    } = questionOptions

    const openingTimestamp = openingDateMoment.unix()
    const questionText = RealitioQuestionLib.encodeText(
      'single-select',
      question,
      outcomes,
      category
    )

    const timeoutResolution = REALITIO_TIMEOUT || networkConfig.getRealitioTimeout()

    const args = [
      SINGLE_SELECT_TEMPLATE_ID,
      questionText,
      arbitratorAddress,
      timeoutResolution,
      openingTimestamp,
      0,
    ]

    const questionId = await this.constantContract.askQuestion(...args, {
      from: signerAddress,
    })

    // send the transaction and wait until it's mined
    const transactionObject = await this.contract.askQuestion(...args, {
      value: '0x0',
    })
    logger.log(`Ask question transaction hash: ${transactionObject.hash}`)
    await this.provider.waitForTransaction(transactionObject.hash)

    return questionId
  }

  askQuestionConstant = async (questionOptions: QuestionOptions): Promise<string> => {
    const {
      arbitratorAddress,
      category,
      networkConfig,
      openingDateMoment,
      outcomes,
      question,
      signerAddress,
    } = questionOptions

    const openingTimestamp = openingDateMoment.unix()
    const questionText = RealitioQuestionLib.encodeText(
      'single-select',
      question,
      outcomes,
      category
    )

    const timeoutResolution = REALITIO_TIMEOUT || networkConfig.getRealitioTimeout()

    const args = [
      SINGLE_SELECT_TEMPLATE_ID,
      questionText,
      arbitratorAddress,
      timeoutResolution,
      openingTimestamp,
      0,
    ]

    const questionId = await this.constantContract.askQuestion(...args, {
      from: signerAddress,
    })

    return questionId
  }

  async getQuestion(questionId: string, earliestBlockToCheck: number): Promise<Question> {
    const filter = this.contract.filters.LogNewQuestion(questionId)

    const logs = await this.provider.getLogs({
      ...filter,
      fromBlock: earliestBlockToCheck,
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
      outcomes,
      templateId,
      raw: question,
    }
  }

  async isFinalized(questionId: string): Promise<boolean> {
    try {
      const isFinalized = await this.contract.isFinalized(questionId)
      return isFinalized
    } catch (err) {
      logger.error(
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
      logger.error(
        `There was an error querying the result for question with id '${questionId}'`,
        err.message
      )
      throw err
    }
  }
}
