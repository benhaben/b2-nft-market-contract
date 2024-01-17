import { HardhatRuntimeEnvironment } from "hardhat/types";
import { task } from "hardhat/config";
import { B2NFTFactory__factory } from "../../typechain-types";
import { EventLog } from "ethers";

task("collection", "create collection")
  .addParam("key", "owner key")
  .addParam("factory", "factory address")
  .addParam("recipient", "royalty recipient")
  .addParam("name", "name")
  .addParam("symbol", "symbol")
  .addParam("uri", "uri")
  .setAction(
    async ({ key, factory, recipient, uri, name, symbol }: any, hre: HardhatRuntimeEnvironment) => {
      try {
        console.log(`key=${key}, factory=${factory}, royaltyRecipient=${recipient}, uri=${uri}, name=${name}, symbol=${symbol}`);
        const ethers = hre.ethers;
        const network = hre.network;
        console.log(network.name);
        const b2NFTFactory = B2NFTFactory__factory.connect(factory, new ethers.Wallet(key, ethers.provider));
        const tx = await b2NFTFactory.createNFTCollection(
          name,
          symbol,
          uri
        );
        const receipt = await tx.wait();
        let log = receipt?.logs.find((log) => b2NFTFactory.interface.parseLog(log as any)?.name === "CreatedNFTCollection") as EventLog;
        console.log(`nft=${log.args.nft}`);
      } catch (e) {
        console.log(e);
      }
    }
  );
