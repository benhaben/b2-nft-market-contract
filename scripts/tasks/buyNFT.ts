import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2NFTMarketplace__factory } from "../../typechain-types";

task("buy", "buy nft")
  .addParam("nft", "nft Address")
  .addParam("id", "token id")
  .addParam("key", "sender key")
  .addParam("pay", "Payable Token Address")
  .addParam("price", "price")
  .addParam("market", "Market Address")
  .setAction(
    async (
      { nft, id, key, pay, price, market }: any,
      hre: HardhatRuntimeEnvironment
    ) => {

      console.log("buy nft start");
      const ethers = hre.ethers;
      await hre.run("erc20:approve", {
        pay: pay,
        key: key,
        spender: market,
        amount: price,
      });
      market = B2NFTMarketplace__factory.connect( market,  new ethers.Wallet(key, ethers.provider));
      const tx = await market.buyNFT(
        nft,
        id,
        pay,
        ethers.parseEther(price)
      );
      const receipt = await tx.wait();
      console.log(receipt.hash);
      console.log("buy nft end");
    }
  );
