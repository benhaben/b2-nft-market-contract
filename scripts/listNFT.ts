import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2NFTMarketplace__factory } from "../typechain-types";

task("list", "list nft")
  .addParam("key", "sender key")
  .addParam("nft", "nft Address")
  .addParam("id", "nft id")
  .addParam("pay", "Payable Token Address")
  .addParam("price", "price")
  .addParam("market", "Market Address")
  .setAction(
    async (
      { key,  nft, id, pay, price, market }: any,
      hre: HardhatRuntimeEnvironment
    ) => {

      console.log("list nft start");
      const ethers = hre.ethers;
      await hre.run("erc721:approve", { key, nft, spender: market });
      market = B2NFTMarketplace__factory.connect( market,  new ethers.Wallet(key, ethers.provider));
      const tx = await market.listNft(
        nft,
        id,
        pay,
        ethers.parseEther(price)
      );
      const receipt = await tx.wait();
      console.log(receipt.hash);
      console.log("list nft end");
    }
  );
