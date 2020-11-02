const { exec } = require('child_process')
require('dotenv-flow').config()

exec(
  `apollo client:codegen src/types/generatedGQLForCTE.ts --endpoint ${process.env.REACT_APP_CTE_GRAPH_HTTP_RINKEBY} --excludes=src/queries/OMEN* --outputFlat --target typescript`,
  err => {
    if (err) {
      console.log(err)
      return
    }

    console.log(`GQL Types generated from endpoint: ${process.env.REACT_APP_CTE_GRAPH_HTTP_RINKEBY}`)
  },
)

exec(
  `apollo client:codegen src/types/generatedGQLForOMEN.ts --endpoint ${process.env.REACT_APP_OMEN_GRAPH_HTTP_RINKEBY} --excludes=src/queries/CTE* --outputFlat --target typescript`,
  err => {
    if (err) {
      console.log(err)
      return
    }

    console.log(`GQL Types generated from endpoint: ${process.env.REACT_APP_CTE_GRAPH_HTTP_RINKEBY}`)
  },
)
