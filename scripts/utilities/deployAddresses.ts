import globalTestnet from "../../global.bsctestnet.json"
import globalDev from "../../global.dev.json"
import { logger } from "./log"
logger.debug(`load deployAddresses - process.env.HARDHAT_NETWORK: ${process.env.HARDHAT_NETWORK}`)
export let deployAddresses: any
if (process.env.HARDHAT_NETWORK == "localhost" || process.env.HARDHAT_NETWORK == "hardhat") {
  logger.debug("load globalDev")
  deployAddresses = globalDev
} else {
  logger.debug("load globalTestnet")
  deployAddresses = globalTestnet
}
