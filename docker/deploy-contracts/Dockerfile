FROM node:10

WORKDIR ganache

ENV PATH="./node_modules/.bin:${PATH}"

COPY prepare_db.sh ERC20.bin ./

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/* \
  && npm install eth-cli@2.0.1 \
  && git clone https://github.com/realitio/realitio-contracts.git realitio && \
  cd realitio && \
  git checkout 4db8f118b5fa90b6f5fc362a8fd5b701b9aa5006 && \
  npm install && cd .. \
  && git clone https://github.com/gnosis/conditional-tokens-contracts.git && \
  cd conditional-tokens-contracts && \
  git checkout eeefca66eb46c800a9aaab88db2064a99026fde5 && \
  npm install && cd .. \
  && git clone https://github.com/fvictorio/realitio-gnosis-proxy && \
  cd realitio-gnosis-proxy && \
  git checkout 64e70b9248413a5ed2af5269b816f14bd4cd1db0 && \
  yarn && cd .. \
  && git clone https://github.com/gnosis/1155-to-20 && \
  cd 1155-to-20 && \
  git checkout 1f18dbee729b74bb9972b80172bf6f67b904eaf9 && \
  yarn && cd .. \
  && chmod +x prepare_db.sh

ENTRYPOINT [ "/bin/sh" ]