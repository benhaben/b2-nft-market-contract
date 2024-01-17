import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2NFTMarketplace, B2NFTMarketplace__factory } from "../../typechain-types";

task("addPayableToken", "create collection")
  .addParam("key", "owner key")
  .addParam("market", "market address")
  .addParam("pay", "pay token address")
  .setAction(async ({ key, market, pay }, hre: HardhatRuntimeEnvironment) => {
    try {
      console.log(`key=${key}, market=${market}, payToken=${pay}`);
      const ethers = hre.ethers;
      const network = hre.network;
      console.log(network.name);
      let b2NFTMarketplace = B2NFTMarketplace__factory.connect( market,   new ethers.Wallet(key, ethers.provider));
      await b2NFTMarketplace.addPayableToken(pay);
    } catch (e) {
      console.log(e);
    }
  });
