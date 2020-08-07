FROM node:14-alpine

ENV PATH="./hg-subgraph/node_modules/.bin:${PATH}"

RUN apk --update add git python make g++ libsecret-dev pkgconfig && rm -rf /var/cache/apk/* && \
    pkg-config --libs-only-l libsecret-1 && \
    git clone https://github.com/gnosis/hg-subgraph.git && \
    cd hg-subgraph && \
    git checkout 23385a400f14ae2060fd6a90fb0552cfedc7953a && \
    npm install

ENTRYPOINT ["graph"]