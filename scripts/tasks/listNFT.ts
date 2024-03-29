import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2CollectionFactory__factory, B2NFTMarketplace__factory } from "../../typechain-types";
import { B2NFTFactory__factory } from "../../typechain-types/factories/contracts/B2NFTFactory__factory";

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

task("modify", "modify list nft price")
  .addParam("key", "sender key")
  .addParam("nft", "nft Address")
  .addParam("id", "nft id")
  .addParam("price", "price")
  .addParam("market", "Market Address")
  .setAction(
    async (
      { key,  nft, id, pay, price, market }: any,
      hre: HardhatRuntimeEnvironment
    ) => {

      console.log("modify list nft price start");
      const ethers = hre.ethers;
      market = B2NFTMarketplace__factory.connect( market,  new ethers.Wallet(key, ethers.provider));
      const tx = await market.modifyListedNFT(
        nft,
        id,
        ethers.parseEther(price)
      );
      const receipt = await tx.wait();
      console.log(receipt.hash);
      console.log("modify list nft price end");
    }
  );

task("isactive", "is active nft")
  .addParam("key", "sender key")
  .addParam("nft", "nft Address")
  .addParam("factory", "factory Address")
  .setAction(
    async (
      { key,  nft, factory }: any,
      hre: HardhatRuntimeEnvironment
    ) => {

      console.log("is active nft start");
      const ethers = hre.ethers;
      factory = B2CollectionFactory__factory.connect(factory,  new ethers.Wallet(key, ethers.provider));
      console.log(await factory.isActive(nft));
      console.log("is active nft end");
    }
  );
