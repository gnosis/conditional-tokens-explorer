FROM node:12-alpine

ENV PATH="./omen-subgraph/node_modules/.bin:${PATH}"

COPY create_subgraph.sh ./

RUN apk --update add bash git python make g++ libsecret-dev pkgconfig && rm -rf /var/cache/apk/* && \
    pkg-config --libs-only-l libsecret-1 && \
    npm install -g ganache-cli && \
    chmod +x create_subgraph.sh && \
    git clone https://github.com/protofire/omen-subgraph.git && \
    cd omen-subgraph && \
    git checkout 8fcc34a92020d9707eae26ad3a19579554ecc227 && \
    yarn install && cd -

ENTRYPOINT [ "./create_subgraph.sh" ]