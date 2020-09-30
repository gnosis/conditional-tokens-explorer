FROM node:10

WORKDIR ganache

ENV PATH="./node_modules/.bin:${PATH}"

COPY prepare_db.sh ERC20.bin ./

RUN apt-get update && apt-get install -y jq && rm -rf /var/lib/apt/lists/* \
  && npm install eth-cli@2.0.1 \
  && git clone https://github.com/realitio/realitio-contracts.git realitio && \
  cd realitio && \
  git checkout ada36fd5031e863526a1d580cc6638937b3500fb && \
  npm install && cd .. \
  && git clone https://github.com/gnosis/conditional-tokens-contracts.git && \
  cd conditional-tokens-contracts && \
  git checkout 7ad77eb4cba295b12de4d9f5977d641eeb2044ae && \
  npm install && cd .. \
  && git clone https://github.com/fvictorio/realitio-gnosis-proxy && \
  cd realitio-gnosis-proxy && \
  git checkout 040dce3e9c0c8edbb36767e7b029bbe6ccf1af4a && \
  yarn && cd .. \
  && git clone https://github.com/gnosis/1155-to-20 && \
  cd 1155-to-20 && \
  git checkout ef77f81fde487bc55814ca4e8f9e728a15d69774 && \
  yarn && cd .. \
  && chmod +x prepare_db.sh

ENTRYPOINT [ "/bin/sh" ]