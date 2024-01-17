import { Etherscan } from "@nomicfoundation/hardhat-verify/etherscan";
import { sleep } from "@nomicfoundation/hardhat-verify/internal/utilities";
import sourceCode from "../artifacts/build-info/6df973fd0c00eb50a8bb880c6ad7e796.json"
const instance = new Etherscan(
  "abc123def123", // Etherscan API key
  "https://zkevm-rpc.bsquared.network", // Etherscan API URL
  "https://testnet.bsquared.network/" // Etherscan browser URL
);
const contractAddress = "0xF2265d757BAC73173577c835e7F5AE3182285d10"
async function main() {
  if (!instance.isVerified(contractAddress)) {
    const { message: guid } = await instance.verify(
      // Contract address
      contractAddress,
      // Contract source code
      `${sourceCode.input}`,
      // Contract name
      "contracts/B2CollectionFactory.sol.sol:B2CollectionFactory.sol",
      // Compiler version
      "v0.8.20",
      // Encoded constructor arguments
      ""
    );

    await sleep(1000);
    const verificationStatus = await instance.getVerificationStatus(guid);

    if (verificationStatus.isSuccess()) {
      const contractURL = instance.getContractUrl("0x123abc...");
      console.log(
        `Successfully verified contract "MyContract" on Etherscan: ${contractURL}`
      );
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;

})