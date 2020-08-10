FROM node:14-alpine

ENV PATH="./hg-subgraph/node_modules/.bin:${PATH}"

COPY create_subgraph.sh ./

RUN apk --update add git python make g++ libsecret-dev pkgconfig && rm -rf /var/cache/apk/* && \
    pkg-config --libs-only-l libsecret-1 && \
    chmod +x create_subgraph.sh && \
    git clone https://github.com/gnosis/hg-subgraph.git && \
    cd hg-subgraph && \
    git checkout 23385a400f14ae2060fd6a90fb0552cfedc7953a && \
    npm install && cd -

ENTRYPOINT [ "./create_subgraph.sh" ]