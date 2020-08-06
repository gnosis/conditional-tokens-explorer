FROM node:10

WORKDIR ganache

ENV PATH="./node_modules/.bin:${PATH}"

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/* \
#RUN apk --update add jq && rm -rf /var/cache/apk/* \
  && npm install ganache-cli@6.8.2 eth-cli@2.0.0-beta-6 \
  && git clone https://github.com/realitio/realitio-contracts.git realitio && \
  cd realitio && \
  git checkout ada36fd5031e863526a1d580cc6638937b3500fb && \
  npm install && cd .. \
  && git clone https://github.com/gnosis/conditional-tokens-contracts.git && \
  cd conditional-tokens-contracts && \
  git checkout 7ad77eb4cba295b12de4d9f5977d641eeb2044ae && \
  npm install && cd .. \
  && git clone https://github.com/gnosis/conditional-tokens-market-makers.git && \
  cd conditional-tokens-market-makers && \
  git checkout 1556d13053450521846b15659d933c874c8e06ff && \
  npm install && cd .. \
  && git clone https://github.com/fvictorio/realitio-gnosis-proxy && \
  cd realitio-gnosis-proxy && \
  git checkout 040dce3e9c0c8edbb36767e7b029bbe6ccf1af4a && \
  yarn

# deploy contracts in ganache
COPY prepare_db.sh ERC20.bin ./
RUN chmod +7 prepare_db.sh && ./prepare_db.sh

EXPOSE 8545

CMD ["ganache-cli", "-d", "--db", "db", "-h", "0.0.0.0", "-i", "50"]