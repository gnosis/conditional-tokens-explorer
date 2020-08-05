FROM node:10

ENV PATH="./node_modules/.bin:${PATH}"

# clone git@github.com:gnosis/hg-subgraph.git
RUN git clone git@github.com:gnosis/hg-subgraph.git hg-subgraph && \
    cd hg-subgraph && \
    git checkout 23385a400f14ae2060fd6a90fb0552cfedc7953a && \
    npm install