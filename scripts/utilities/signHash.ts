import ethers, { utils } from "ethers"
import { FormatTypes, Fragment, Interface } from "ethers/lib/utils"

const f = Fragment.from("event PushDebtLog(uint256 index, uint256, uint256);")
console.log(`${JSON.stringify(f.format(FormatTypes.sighash))}`)

const k = utils.keccak256(utils.toUtf8Bytes(f.format(FormatTypes.sighash)))
console.log(`${JSON.stringify(k)}`)
