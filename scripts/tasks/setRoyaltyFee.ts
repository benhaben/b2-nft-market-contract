import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2NFTMarketplace__factory } from "../../typechain-types";

task("setRoyaltyFee", "Set Royalty Fee")
  .addParam("key", "owner key")
  .addParam("market", "market address")
  .addParam("nft", "nft address")
  .addParam("fee", "fee")
  .addParam("receiver", "receipt address")
  .setAction(async ({ key, market, nft, fee, receiver }, hre: HardhatRuntimeEnvironment) => {
    try {
      console.log(`key=${key}, market=${market}, nft=${nft}, fee=${fee}, receipt=${receiver}`);
      const ethers = hre.ethers;
      const network = hre.network;
      console.log(network.name);
      let  marketplace = B2NFTMarketplace__factory.connect(market, new ethers.Wallet(key, ethers.provider));
      await marketplace.setRoyaltyFee(nft, BigInt(fee), receiver);
    } catch (e) {
      console.log(e);
    }
  });
