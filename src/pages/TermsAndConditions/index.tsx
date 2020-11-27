import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { BaseCard } from 'components/pureStyledComponents/BaseCard'
import { Li, OrderedList } from 'components/pureStyledComponents/Lists'
import { PageTitle } from 'components/pureStyledComponents/PageTitle'
import { PageTitleNote } from 'components/pureStyledComponents/PageTitleNote'
import { Paragraph } from 'components/pureStyledComponents/Paragraph'
import { Title } from 'components/pureStyledComponents/Title'

const BaseCardGrow = styled(BaseCard)`
  flex-grow: 1;
`

const PageTitleStyled = styled(PageTitle)`
  margin: 0;
`

const OrderedListMultiNumber = styled(OrderedList)`
  counter-reset: item;
`

const LiMultiNumber = styled(Li)`
  display: block;
  margin-left: 0;

  &:before {
    content: counters(item, '.') '. ';
    counter-increment: item;
    display: inline-block;
    margin-right: 10px;
  }

  > ol {
    margin-left: 20px;
  }
`

const LiTitle = styled(Title)`
  display: inline-block;
  margin: 30px 0 10px 0;
`

const ColorToMakeSurePeopleNoticesTheText = styled.span`
  color: ${(props) => props.theme.colors.error};
`

const LiTitleNoMarginTop = styled(LiTitle)`
  margin-top: 0;
`

export const TermsAndConditions: React.FC = () => {
  return (
    <>
      <PageTitleStyled>Terms</PageTitleStyled>
      <PageTitleNote>(last updated: October 2020)</PageTitleNote>
      <BaseCardGrow>
        <Paragraph>
          <ColorToMakeSurePeopleNoticesTheText>
            THESE TERMS CREATE A BINDING LEGAL CONTRACT BETWEEN YOU AND GNOSIS LIMITED. BY USING OUR
            SERVICES (DEFINED BELOW), YOU AGREE TO BE BOUND BY THESE TERMS. IF YOU DO NOT ACCEPT THE
            TERMS, YOU MUST NOT AND ARE NOT AUTHORIZED TO USE ANY OF OUR SERVICES.
          </ColorToMakeSurePeopleNoticesTheText>
        </Paragraph>
        <Paragraph>
          <ColorToMakeSurePeopleNoticesTheText>
            FOR PERSONS RESIDING IN THE USA: THESE TERMS CONTAIN ADDITIONAL PROVISIONS APPLICABLE
            ONLY TO YOU. THEY CONTAIN AN ARBITRATION PROVISION. IF WE CANNOT RESOLVE A DISPUTE
            AMICABLY, ALL DISPUTES ARISING UNDER OR IN CONNECTION WITH THIS AGREEMENT MUST BE
            SETTLED IN BINDING ARBITRATION PER CLAUSE 27.4. ENTERING INTO THIS AGREEMENT CONSTITUTES
            A WAIVER OF YOUR RIGHT, IF ANY, TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR A JURY
            TRIAL.
          </ColorToMakeSurePeopleNoticesTheText>
        </Paragraph>
        <OrderedListMultiNumber>
          <LiMultiNumber>
            <LiTitleNoMarginTop>What is the scope of the Terms?</LiTitleNoMarginTop>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                These Terms of Service (the <strong>&quot;Agreement&quot;</strong>) are a legal
                agreement between you (<strong>&quot;you&quot;</strong> or{' '}
                <strong>&quot;yours&quot;</strong>) and Gnosis Limited (
                <strong>&quot;Gnosis&quot;</strong>, <strong>&quot;we&quot;</strong>,{' '}
                <strong>&quot;our&quot;</strong> or <strong>&quot;us&quot;</strong>). We are a
                company limited by shares registered in Gibraltar under company no. 115571, with its
                registered office at the World Trade Center, 6 Bayside Rd, GX11 1AA, Gibraltar. You
                can contact us by writing to <a href="mailto:info@gnosis.io">info@gnosis.io</a>.
              </LiMultiNumber>
              <LiMultiNumber>
                By using any service offered by us, whether through{' '}
                <a href="https://cte.gnosis.io/" rel="noopener noreferrer" target="_blank">
                  https://cte.gnosis.io/
                </a>
                , any associated website, API, or applications (collectively, the{' '}
                <strong>&quot;Services&quot;</strong>), you agree that you have read, understood,
                and accept all of the terms and conditions contained in this Agreement, including
                the <NavLink to="cookie-policy">Cookie Policy</NavLink> and the{' '}
                <NavLink to="privacy-policy">Privacy Policy</NavLink> incorporated herein by
                reference, as amended from time to time. If you do not agree with this Agreement,
                you must not use the Services.
              </LiMultiNumber>
              <LiMultiNumber>
                You are responsible for ensuring that all persons who access or use the Services
                through your device or internet connection are aware of this Agreement and its
                terms, and that they comply with them.
              </LiMultiNumber>
              <LiMultiNumber>
                Each time you use our Services you will be bound by the Agreement in force at that
                time. From time to time, we may change its terms. If we do this then we will publish
                those changes on{' '}
                <a href="https://cte.gnosis.io/" rel="noopener noreferrer" target="_blank">
                  https://cte.gnosis.io/
                </a>{' '}
                and you will be bound by those new terms the next time you use our Services. If you
                do not agree to those changes you must not use our Services. You can always ask us
                for the Agreement, which was in force when you used the Services by writing to{' '}
                <a href="mailto:info@gnosis.io">info@gnosis.io</a>. Every time you wish to use the
                Services, please check and ensure that you agree with the latest updated version of
                the Agreement.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What do some of the capitalised terms mean in the Agreement?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Ethereum Blockchain&quot;</strong> means a mathematically secured,
                chronological, and decentralized consensus ledger maintained on an Ethereum Virtual
                Machine.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Transaction&quot;</strong> means a change to the data set through a
                new entry in the continuous Ethereum Blockchain.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Smart Contract&quot;</strong> means a piece of source code deployed as
                an application on the Ethereum Blockchain which can be executed, including
                self-execution of Transactions as well as execution triggered by third parties.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Token&quot;</strong> means a digital asset transferred in a
                Transaction, including ETH, ERC20, ERC721 and ERC1155 tokens.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Wallet&quot;</strong> means a cryptographic storage solution
                permitting you to store cryptographic assets by correlation of a (i) Public Key and
                (ii) a Private Key or a Smart Contract to receive, manage and send Tokens.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Public Key&quot;</strong> means a unique sequence of numbers and
                letters within the Ethereum Blockchain to distinguish the network participants from
                each other.{' '}
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>&quot;Private Key&quot;</strong> means a unique sequence of numbers and/or
                letters required to initiate an Ethereum Blockchain Transaction and should only be
                known by the legal owner of the Wallet.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What are the Services of the Conditional Token Explorer and Factory?</LiTitle>
            <Paragraph style={{ marginBottom: '10px' }}>
              Our Services consist of the provision and maintenance of a web-based graphical user
              interface (<strong>&quot;Interface&quot;</strong>) that allow you to interact
              independently and in modular and self-custodial fashion to:
            </Paragraph>
            <OrderedListMultiNumber>
              <LiMultiNumber>create by splitting,</LiMultiNumber>
              <LiMultiNumber>merge,</LiMultiNumber>
              <LiMultiNumber>transfer, </LiMultiNumber>
              <LiMultiNumber>report on, </LiMultiNumber>
              <LiMultiNumber>redeem,</LiMultiNumber>
              <LiMultiNumber>wrap, </LiMultiNumber>
              <LiMultiNumber>unwrap </LiMultiNumber>
            </OrderedListMultiNumber>
            <Paragraph style={{ marginBottom: '10px' }}>
              any conditional tokens created on the canonical instance of the{' '}
              <a
                href="https://github.com/gnosis/conditional-tokens-contracts"
                rel="noopener noreferrer"
                target="_blank"
              >
                conditional tokens contracts
              </a>{' '}
              on the Ethereum Blockchain.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What do the Services of the CTE not consist of?</LiTitle>
            <Paragraph style={{ marginBottom: '10px' }}>
              Our Services <i>do not</i> consist of:
            </Paragraph>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                activity regulated by the Gibraltar Financial Services Commission or any other
                regulatory agency;
              </LiMultiNumber>
              <LiMultiNumber>
                coverage underwritten by any regulatory agency&apos;s compensation scheme;
              </LiMultiNumber>
              <LiMultiNumber>
                custody of your Private Keys, Tokens or or the ability to remove or freeze your
                Tokens;
              </LiMultiNumber>
              <LiMultiNumber>the storage or transmission of fiat currencies;</LiMultiNumber>
              <LiMultiNumber>
                back-up services to recover your Private Keys, for whose safekeeping you are solely
                responsible;
              </LiMultiNumber>
              <LiMultiNumber>
                any form of legal, financial, accounting, tax or other professional advice regarding
                Transactions and their suitability to you; and
              </LiMultiNumber>
              <LiMultiNumber>
                the responsibility to monitor authorised Transactions or to check the correctness or
                completeness of Transactions before you are authorising them.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>
              Are we responsible for the security of your Private Keys, seed words or other
              credentials?
            </LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We shall not be responsible to secure your Private Keys, seed words, credentials or
                other means of authorization of your Wallet(s).
              </LiMultiNumber>
              <LiMultiNumber>
                You must own and control any Wallet you use in connection with our Services. You are
                responsible for implementing all appropriate measures for securing any Wallet you
                use, including any Private Key(s), seed words, credentials or other means of
                authorization necessary to access such storage mechanism(s).
              </LiMultiNumber>
              <LiMultiNumber>
                We exclude any and all liability for any security breaches or other acts or
                omissions, which result in your loss of access or custody of any cryptographic
                assets stored thereon.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>
              Are you eligible to use our Services and can we check your suitability?
            </LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                To access or use our Services, you must be able to form a legally binding contract
                with us. You must be of legal age in your jurisdiction to use the Services and you
                agree to provide legitimate and lawful documentation proving such status if
                requested or required by us.
              </LiMultiNumber>
              <LiMultiNumber>
                You must have the full right, power, and authority to enter into and comply with
                this Agreement on behalf of yourself and any company or legal entity for which you
                may access or use our Services.
              </LiMultiNumber>
              <LiMultiNumber>
                Our Services are operated out of Gibraltar. The Services may not be available or
                appropriate for use in other jurisdictions. You must not use our Services if your
                use of them would be illegal or otherwise violate any law you are subject to. We are
                not liable for your compliance with such laws.
              </LiMultiNumber>
              <LiMultiNumber>
                You must not be, and will not be, located in any jurisdiction that is the subject of
                an embargo by Gibraltar, the United Kingdom, the European Union or the United States
                and you are not listed on any list of prohibited or restricted parties by those
                foregoing.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Can we terminate or limit your right to use our Services?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We reserve the right, in our sole discretion and for whatever reason, but
                particularly in case you breach any term of this Agreement, to:
                <OrderedListMultiNumber>
                  <LiMultiNumber>
                    terminate your right to use the Services with immediate effect;
                  </LiMultiNumber>
                  <LiMultiNumber>
                    limit use of the Interface(s) or Command Line Interface(s) (the{' '}
                    <strong>&quot;Gnosis Clients&quot;</strong>) to a specified number of persons;{' '}
                  </LiMultiNumber>
                  <LiMultiNumber>
                    refuse to allow a person from using the Gnosis clients; and/or
                  </LiMultiNumber>
                  <LiMultiNumber>
                    remove or exclude any person from using the Gnosis Clients for whatever reason.
                  </LiMultiNumber>
                </OrderedListMultiNumber>
              </LiMultiNumber>
              <LiMultiNumber>
                We will only be able to limit access to the Gnosis Clients. At no time will we be
                able to access or transfer your funds without your consent.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What licenses and access do we grant to you?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                All intellectual property rights in the Services throughout the world belong to us
                as owners or our licensors and the rights in the Service are only licensed to you.
                Nothing in these terms gives you any rights in respect of any intellectual property
                owned by us or our licensors and you acknowledge that you do not acquire any
                ownership rights by downloading the Interface or any content from the Interface.
              </LiMultiNumber>
              <LiMultiNumber>
                The Services may contain code, commonly referred to as open source software, which
                is distributed under open source licence terms, including terms which allow the free
                distribution and modification of the relevant software&apos;s source code and/or
                which require all distributors to make such source code freely available upon
                request, including any contributions or modifications made by such distributor (
                <strong>&quot;Open Source Software&quot;</strong>). To the extent that the Services
                contain any Open Source Software, that element only is licensed to you under the
                relevant licence terms of the applicable third party licensor (
                <strong>&quot;Open Source Licence Terms&quot;</strong>) and not under this
                Agreement, and you accept and agree to be bound by such Open Source Licence Terms.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>
              What can you expect from the Services and can we make changes to them?
            </LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                Except as set out in this Agreement, we do not warrant, represent or guarantee that
                the Services will be accurate, complete, correct, reliable integer, fit for purpose,
                secure or free from weaknesses, vulnerabilities or bugs.
              </LiMultiNumber>
              <LiMultiNumber>
                You understand and accept that you use the Services at your own risk.
              </LiMultiNumber>
              <LiMultiNumber>
                To the fullest extent permitted by law, we provide the Services to you &quot;as
                is&quot; and &quot;as available&quot; without any warranty, representation or
                assurance (whether express or implied) in relation to merchantability, fitness for a
                particular purpose, availability, security, title or non-infringement.
              </LiMultiNumber>
              <LiMultiNumber>
                We reserve the right to change the format and features of the Services.{' '}
              </LiMultiNumber>
              <LiMultiNumber>
                We may cease to provide and/or update content to the Services, with or without
                notice to you, if it improves the Services we provide to you, or we need to do so
                for security, legal or any other reasons.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Do we have any fiduciary duties to you?</LiTitle>
            <Paragraph>
              This Agreement is not intended to, and does not, create or impose any fiduciary duties
              on us. To the fullest extent permitted by law, you acknowledge and agree that we owe
              no fiduciary duties or liabilities to you or any other party, and that to the extent
              any such duties or liabilities may exist at law or in equity, those duties and
              liabilities are hereby irrevocably disclaimed, waived, and eliminated. You further
              agree that the only duties and obligations that we owe you are those set out expressly
              in this Agreement.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What about third-party risk?</LiTitle>
            <Paragraph>
              The Services rely in part on third party and open-source software, including the
              Ethereum Blockchain, and the continued development and support by third parties. There
              is no assurance or guarantee that those third parties will maintain their support of
              their software or that open source software will continue to be maintained. This may
              have a material adverse effect on the Services.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Can your Data Privacy be ensured?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                Our Services are built on the Ethereum Blockchain. Accordingly, by design, and
                practically, the records cannot be changed or deleted and are said to be
                &apos;immutable&apos;. This may affect your ability to exercise your rights such as
                your right to erasure (&apos;right to be forgotten&apos;), or your rights to object
                or restrict processing of your personal data. Data on the Ethereum blockchain cannot
                be erased and cannot be changed.
              </LiMultiNumber>
              <LiMultiNumber>
                In order to comply with some of our contractual obligations to you, it may be
                necessary to write certain personal data onto the Ethereum Blockchain.{' '}
              </LiMultiNumber>
              <LiMultiNumber>
                The ultimate decisions to (i) transact on the Ethereum Blockchain rests with you.
              </LiMultiNumber>
              <LiMultiNumber>
                When using the CTE we may collect and process personal data, including any Wallet
                addresses, Transaction made with the CTE as well as Token balance.
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>
                  IF YOU WANT TO ENSURE YOUR PRIVACY RIGHTS ARE FULLY AVAILABLE, YOU SHOULD NOT
                  TRANSACT ON THE ETHEREUM BLOCKCHAIN AS CERTAIN RIGHTS WILL NOT BE FULLY AVAILABLE
                  OR EXERCISABLE BY YOU OR US.
                </strong>
              </LiMultiNumber>
              <LiMultiNumber>
                For more information please also refer to our{' '}
                <NavLink to="privacy-policy">Privacy Policy</NavLink>.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What do you agree, warrant and represent?</LiTitle>
            <Paragraph style={{ marginBottom: '10px' }}>
              By using our Services you hereby agree, represent and warrant that:
            </Paragraph>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                You are of legal age in your jurisdiction to use the Services and you agree to
                provide legitimate and lawful documentation proving such status if requested or
                required by us.
              </LiMultiNumber>
              <LiMultiNumber>
                You are not a citizen, resident, or member of any jurisdiction or group that is
                subject to economic sanctions by Gibraltar, the European Union or the United States
                or any other relevant jurisdiction.
              </LiMultiNumber>
              <LiMultiNumber>
                You do not appear on HMT Sanctions List, the U.S. Treasury Department&apos;s Office
                of Foreign Asset Control&apos;s sanctions lists, the U.S. commerce department&apos;s
                consolidated screening list, the EU consolidated list of persons, groups or entities
                subject to EU Financial Sanctions, nor do you act on behalf of a person sanctioned
                thereunder.
              </LiMultiNumber>
              <LiMultiNumber>
                You have read and understood this Agreement and agree to be bound by its terms.
              </LiMultiNumber>
              <LiMultiNumber>
                You do not rely on, and shall have no remedy in respect of, any statement,
                representation, assurance or warranty (whether made innocently or negligently) that
                is not set out in this Agreement.
              </LiMultiNumber>
              <LiMultiNumber>
                Your usage of our Services is legal under the laws of your jurisdiction or under the
                laws of any other jurisdiction to which you may be subject.
              </LiMultiNumber>
              <LiMultiNumber>
                You won&apos;t use the Services or interact with the Services in a manner that
                violates any law or regulation, including, without limitation, any applicable export
                control laws.
              </LiMultiNumber>
              <LiMultiNumber>
                You understand the functionality, usage, storage, transmission mechanisms and
                intricacies associated with Tokens (such as ETH, WETH or DAI) as well as token
                storage facilities, blockchain technology and blockchain-based software systems.
              </LiMultiNumber>
              <LiMultiNumber>
                You understand that transactions on the Ethereum Blockchain are irreversible and may
                not be erased and that your wallet address and Transactions are displayed
                permanently and publicly and that you relinquish any right of rectification or
                erasure of personal data.
              </LiMultiNumber>
              <LiMultiNumber>
                You will comply with any applicable tax obligations in your jurisdiction arising
                from your use of the Services.
              </LiMultiNumber>
              <LiMultiNumber>
                You will not misuse or gain unauthorised access to our Services by knowingly
                introducing viruses, cross-site scripting, Trojan horses, worms, time-bombs,
                keystroke loggers, spyware, adware or any other harmful programs or similar computer
                code designed to adversely affect our Services and that in the event you do so or
                otherwise attack our Services, we reserve the right to report any such activity to
                the relevant law enforcement authorities and we will cooperate with those
                authorities as required.
              </LiMultiNumber>
              <LiMultiNumber>
                You won&apos;t access without authority, interfere with, damage or disrupt any part
                of our Services, any equipment or network on which our Services is stored, any
                software used in the provision of our Services or any equipment or network or
                software owned or used by any third party.
              </LiMultiNumber>
              <LiMultiNumber>
                You won&apos;t use our Services for activities that are unlawful or fraudulent or
                have such purpose or effect or otherwise support any activities that breach
                applicable local, national or international law or regulations.
              </LiMultiNumber>
              <LiMultiNumber>
                You won&apos;t use our Services to store, trade or transmit Tokens that are proceeds
                of criminal or fraudulent activity.
              </LiMultiNumber>
              <LiMultiNumber>
                You understand that the Services and the underlying Ethereum Blockchain are in an
                early development stage and we accordingly do not guarantee an error-free process
                and give no price or liquidity guarantee.
              </LiMultiNumber>
              <LiMultiNumber>You are using the Services at your own risk.</LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What if you breach this Agreement?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                You agree that you will be liable for any losses sustained by us as a result of your
                breach of this Agreement and will compensate us in full for any such losses.
              </LiMultiNumber>
              <LiMultiNumber>
                We reserve the right, at our own expense, to assume the exclusive defence and
                control of any matter otherwise subject to indemnification by you pursuant to
                paragraph 1 of this clause and, in such case, you agree to cooperate with us in the
                defence of such matter.
              </LiMultiNumber>
              <LiMultiNumber>
                The indemnity set out in this clause is in addition to, and not in lieu of, any
                other remedies that may be available to us under applicable law.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What about our liability to you?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                Nothing in this Agreement shall limit or exclude our liability to you:
                <OrderedListMultiNumber>
                  <LiMultiNumber>
                    for death or personal injury caused by our negligence;
                  </LiMultiNumber>
                  <LiMultiNumber>for fraudulent misrepresentation; or</LiMultiNumber>
                  <LiMultiNumber>
                    for any other liability that, by law, may not be limited or excluded.
                  </LiMultiNumber>
                </OrderedListMultiNumber>
              </LiMultiNumber>
              <LiMultiNumber>
                Subject to this, in no event shall we be liable to you for any losses, including any
                loss of Tokens or any indirect or consequential losses, or for any loss of profit,
                revenue, contracts, data, goodwill or other similar losses.
              </LiMultiNumber>
              <LiMultiNumber>
                Any liability we do have for losses you suffer arising from this Agreement per 16.1
                must be strictly limited to losses that were reasonably foreseeable and shall not be
                in excess of the amounts paid by you to us, if any, in connection with the Services
                in the 12 month period preceding this applicable claim.
              </LiMultiNumber>
              <LiMultiNumber>
                Where we are operating in conjunction with third parties and/or any other third
                party systems, we are not responsible for any loss as a result of such third party
                activity. If any Transaction is, as a result of your actions or those of a third
                party, mistakenly or fraudulently signed for using your Private Keys, we are not
                liable.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What about viruses, bugs and security vulnerabilities?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We do not guarantee that our Services will be secure or free from bugs, security
                vulnerabilities or viruses.
              </LiMultiNumber>
              <LiMultiNumber>
                You are responsible for configuring your information technology and computer
                programmes to access our Services and to use your own virus protection software.
              </LiMultiNumber>
              <LiMultiNumber>
                If you become aware of any exploits, bugs or vulnerabilities, please let us know at{' '}
                <a href="mailto:info@gnosis.io">info@gnosis.io</a> and{' '}
                <a href="mailto:bounty@gnosis.io">bounty@gnosis.io</a>.
              </LiMultiNumber>
              <LiMultiNumber>
                You must not misuse our Services by knowingly introducing material that is malicious
                or technologically harmful. If you do, your right to use our Services will cease
                immediately.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Can you link to our CTE Interface?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                You may link to our Interface, provided you do so in a way that is fair and legal
                and does not damage our reputation. You must not establish a link in such a way as
                to suggest any form of association, approval or endorsement on our part where none
                exists. You must not establish a link to our Services in any application that is not
                owned by or licensed to you.
              </LiMultiNumber>
              <LiMultiNumber>
                The graphical user interface or application in which you are linking must comply in
                all respects with the content standards set out in this Agreement. If you wish to
                link to or make any use of content on our Interface other than that set out above,
                please contact <a href="mailto:legal@gnosis.io">legal@gnosis.io</a>.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>
              What if an event outside our control happens that affects our Services?
            </LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We may update and change our Services from time to time. We may suspend or withdraw
                or restrict the availability of all or any part of our Services for business,
                operational or regulatory reasons or because of a Force Majeure Event at no notice.
              </LiMultiNumber>
              <LiMultiNumber>
                A <strong>&quot;Force Majeure Event&quot;</strong> shall mean any event,
                circumstance or cause beyond our reasonable control, which prevents, hinders or
                delays the provision of our Services or makes their provision impossible or onerous,
                including, without limitation:
                <OrderedListMultiNumber>
                  <LiMultiNumber>
                    acts of God, flood, storm, drought, earthquake or other natural disaster;
                  </LiMultiNumber>
                  <LiMultiNumber>
                    epidemic or pandemic (for the avoidance of doubt, including the 2020 Pandemic);
                  </LiMultiNumber>
                  <LiMultiNumber>
                    terrorist attack, hacking or cyber threats, civil war, civil commotion or riots,
                    war, threat of or preparation for war, armed conflict, imposition of sanctions,
                    embargo, or breaking off of diplomatic relations;
                  </LiMultiNumber>
                  <LiMultiNumber>
                    equipment or software malfunction or bugs including network splits or forks or
                    unexpected changes in the Ethereum Blockchain, as well as hacks, phishing
                    attacks, distributed denials of service or any other security attacks;
                  </LiMultiNumber>
                  <LiMultiNumber>nuclear, chemical or biological contamination;</LiMultiNumber>
                  <LiMultiNumber>
                    any law statutes, ordinances, rules, regulations, judgments, injunctions, orders
                    and decrees or any action taken by a government or public authority, including
                    without limitation imposing a prohibition, or failing to grant a necessary
                    licence or consent;
                  </LiMultiNumber>
                  <LiMultiNumber>
                    collapse of buildings, breakdown of plant or machinery, fire, explosion or
                    accident; and
                  </LiMultiNumber>
                  <LiMultiNumber>strike, industrial action or lockout.</LiMultiNumber>
                </OrderedListMultiNumber>
              </LiMultiNumber>
              <LiMultiNumber>
                We shall not be liable or responsible to you, or be deemed to have defaulted under
                or breached this Agreement, for any failure or delay in the provision of the
                Services or the performance of this Agreement, if and to the extent such failure or
                delay is caused by or results from or is connected to acts beyond our reasonable
                control, including the occurrence of a Force Majeure Event.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Who is responsible for your tax liabilities?</LiTitle>
            <Paragraph>
              You are solely responsible to determine if your use of the Services have tax
              implications for you. By using the Services you agree not to hold us liable for any
              tax liability associated with or arising from the operation of the Services or any
              other action or transaction related thereto.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What if a court disagrees with part of this Agreement?</LiTitle>
            <Paragraph>
              Each of the paragraphs of this Agreement operates separately. If any court or relevant
              authority decides that any of them are unlawful, the remaining paragraphs will
              continue to be in full force and effect.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>What if we do not enforce certain rights under this Agreement?</LiTitle>
            <Paragraph>
              Our failure to exercise or enforce any right or remedy provided under this Agreement
              or by law shall not constitute a waiver of that or any other right or remedy, nor
              shall it prevent or restrict any further exercise of that or any other right or
              remedy.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Do third parties have rights?</LiTitle>
            <Paragraph>
              Unless it expressly states otherwise, this Agreement does not give rise to any third
              party rights, which may be enforced against us.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Can this Agreement be assigned?</LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We may transfer our rights and obligations under this Agreement to any other party.
              </LiMultiNumber>
              <LiMultiNumber>
                You shall not be entitled to assign this Agreement to any third party without our
                express prior written consent.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Which clauses of this Agreement survive termination?</LiTitle>
            <Paragraph>
              All covenants, agreements, representations and warranties made in this Agreement shall
              survive your acceptance of this Agreement and its termination.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Which laws apply to this agreement?</LiTitle>
            <Paragraph>
              This Agreement is governed by and construed in accordance with Gibraltar law.
            </Paragraph>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>How can you get support for the CTE and tell us about any problems?</LiTitle>
            <Paragraph style={{ marginBottom: '10px' }}>
              If you want to learn more about the CTE or have any problems using the CTE or have
              complaints please get in touch with us via any of the following channels:
            </Paragraph>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                <strong>Email:</strong> <a href="mailto:info@gnosis.io">info@gnosis.io</a>
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>Twitter:</strong>{' '}
                <a href="https://twitter.com/gnosisPM" rel="noopener noreferrer" target="_blank">
                  @gnosisPM
                </a>
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>Discord:</strong>{' '}
                <a href="https://chat.gnosis.io" rel="noopener noreferrer" target="_blank">
                  https://chat.gnosis.io
                </a>
              </LiMultiNumber>
              <LiMultiNumber>
                <strong>Github:</strong>{' '}
                <a
                  href="https://github.com/gnosis/conditional-tokens-explorer"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  https://github.com/gnosis/conditional-tokens-explorer
                </a>
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>
              How can we resolve disputes and where can you bring legal proceedings?
            </LiTitle>
            <OrderedListMultiNumber>
              <LiMultiNumber>
                We will use our best efforts to resolve through informal, good faith negotiations
                any dispute, claim or controversy relating to this Agreement or relating to the
                breach, termination, enforcement, interpretation or validity thereof, including the
                determination of the scope or applicability of the arbitration agreement in clause
                27.4 (hereinafter <strong>&quot;Dispute&quot;</strong>).
              </LiMultiNumber>
              <LiMultiNumber>
                If a potential Dispute arises, you must contact us by sending an email to{' '}
                <a href="mailto:legal@gnosis.io">legal@gnosis.io</a> so that we can attempt to
                resolve it without resorting to formal dispute resolution.
              </LiMultiNumber>
              <LiMultiNumber>
                If we are not able to reach an informal resolution within 60 days of your email,
                then you and we may bring proceedings either in binding arbitration, if clause 27.4
                applies to you, or in the courts of Gibraltar, if clause 27.4 does not apply to you.
              </LiMultiNumber>
              <LiMultiNumber>
                <ColorToMakeSurePeopleNoticesTheText>
                  IF YOU ARE RESIDING IN THE UNITED STATES OF AMERICA (&quot;USA&quot;), THIS CLAUSE
                  27.4 REQUIRES YOU TO ARBITRATE ALL DISPUTES WITH US AND LIMITS THE MANNER IN WHICH
                  YOU CAN SEEK RELIEF FROM US.
                </ColorToMakeSurePeopleNoticesTheText>
                <OrderedListMultiNumber>
                  <LiMultiNumber>
                    <strong>Binding arbitration.</strong> Any Dispute shall be referred to and
                    finally determined by binding and confidential arbitration in accordance with
                    the JAMS International Arbitration Rules (&quot;JAMS Rules&quot;), hereby
                    incorporated by reference and available from JAMS&apos; website at{' '}
                    <a href="https://www.jamsadr.com/" rel="noopener noreferrer" target="_blank">
                      https://www.jamsadr.com/
                    </a>
                    .
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Federal Arbitration Act.</strong> This Agreement affects interstate
                    commerce and the enforceability of this clause 27.4 will be both substantively
                    and procedurally governed by and construed and enforced in accordance with the
                    United States Federal Arbitration Act, 9 U.S.C. §1 et seq. (
                    <strong>&quot;FAA&quot;</strong>), to the maximum extent permitted by applicable
                    law.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>The Arbitral Process.</strong> The arbitral tribunal shall consist of a
                    sole arbitrator. Only as limited by the FAA, this Agreement and the JAMS Rules,
                    the arbitrator, and not any federal, state or local court or agency, shall have
                    exclusive authority to resolve all Disputes and shall be empowered to grant
                    whatever relief would be available in a court under law or in equity. The
                    arbitrator&apos;s award shall be in writing, and binding on the parties and may
                    be entered as a judgment in any court of competent jurisdiction.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Seat.</strong> The seat, or place of, of arbitration will be New York.
                    The language to be used in the arbitration proceedings shall be English. You
                    agree to submit to the personal jurisdiction of any federal or state court in
                    New York County, New York, in order to compel arbitration, to stay proceedings
                    pending arbitration, or to confirm, modify, vacate or enter judgment on the
                    award entered by the arbitrator. This clause 27.4 shall not preclude parties
                    from seeking provisional remedies in aid of arbitration from a court of
                    applicable jurisdiction.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Class Action Waiver.</strong> You and we agree that any arbitration
                    shall be conducted in individual capacity only and not as a class action or
                    other representative action, and you and we expressly waive the right to file a
                    class action or seek relief on a class basis.{' '}
                    <ColorToMakeSurePeopleNoticesTheText>
                      YOU AND WE AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN
                      INDIVIDUAL CAPACITY, AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED
                      CLASS OR REPRESENTATIVE PROCEEDING.{' '}
                    </ColorToMakeSurePeopleNoticesTheText>
                    If any court, arbitrator or arbitral tribunal determines that the class action
                    waiver set forth in this paragraph is void or unenforceable for any reason or
                    that an arbitration can proceed on a class basis, then the arbitration provision
                    set forth above shall be deemed null and void in its entirety and the parties
                    shall be deemed to have NOT agreed to arbitrate disputes.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Exception: Litigation of IP and Small Claims Court Claims.</strong>{' '}
                    Notwithstanding the parties&apos; decision to resolve all disputes through
                    arbitration, either party may bring an action in any applicable court to protect
                    its intellectual property rights (&quot;intellectual property rights&quot; means
                    patents, copyrights, moral rights, trademarks, and trade secrets, but not
                    privacy or publicity rights). Either party may also seek relief in a small
                    claims court for disputes or claims within the scope of that court&apos;s
                    jurisdiction.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Right to Opt-Out.</strong> You have the right to opt-out and not be
                    bound by the arbitration and class action waiver provisions set forth above by
                    sending written notice of your decision to opt-out via email to{' '}
                    <a href="mailto:legal@gnosis.pm">
                      <strong>legal@gnosis.pm</strong>
                    </a>
                    . The notice must be sent within 30 days of 10 November 2020 or your first use
                    of our Services, whichever is later, otherwise you shall be bound to arbitrate
                    disputes in accordance with the terms of those paragraphs. If you opt-out of
                    these arbitration provisions, we also will not be bound by them.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Changes.</strong> We will provide 60-days&apos; notice of any changes to
                    this clause 27.4. Changes will become effective on the 60th day, and will apply
                    prospectively only to any claims arising after the 60th day.
                  </LiMultiNumber>
                  <LiMultiNumber>
                    <strong>Fair Representation.</strong> The parties agree that, wherever
                    practicable, they will seek to appoint a fair representation of diverse
                    arbitrators (considering gender, ethnicity and sexual orientation), and will
                    request administering institutions to include a fair representation of diverse
                    candidates on their rosters and list of potential arbitrator appointees.
                  </LiMultiNumber>
                </OrderedListMultiNumber>
              </LiMultiNumber>
              <LiMultiNumber>
                You and we agree that the Courts of Gibraltar shall have exclusive jurisdiction to
                settle any Dispute that is not subject to arbitration under clause 27.4 and that any
                Dispute must be resolved in accordance with Gibraltar law without regard to its
                conflict of law provisions. You and we further agree that any Dispute is personal to
                you and us and shall be resolved solely through individual action, and will not be
                brought as a representative action, group litigation order or any other type of
                class or collective action proceeding.
              </LiMultiNumber>
            </OrderedListMultiNumber>
          </LiMultiNumber>
          <LiMultiNumber>
            <LiTitle>Is this all?</LiTitle>
            <Paragraph>
              This Agreement constitutes the entire agreement between you and us in relation to the
              Agreement&apos;s subject matter. It replaces and extinguishes any and all prior
              agreements, draft agreements, arrangements, warranties, statements, assurances,
              representations and undertakings of any nature made by, or on behalf of either of us,
              whether oral or written, public or private, in relation to that subject matter.
            </Paragraph>
          </LiMultiNumber>
        </OrderedListMultiNumber>
        <Paragraph>
          Gnosis Limited
          <br />
          World Trade Center
          <br />
          6 Bayside Rd
          <br />
          GIBRALTAR
          <br />
          GX11 1AA
        </Paragraph>
      </BaseCardGrow>
    </>
  )
}
