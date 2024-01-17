import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ERC20__factory, ERC721Upgradeable__factory } from "../../typechain-types";

task("erc721:approve", "ERC721 approve")
  .addParam("key", "sender key")
  .addParam("nft", "nft")
  .addParam("spender", "Spender")
  .setAction(
    async ({ key, nft, spender }: any, hre: HardhatRuntimeEnvironment) => {
      console.log(`erc721:approve start`);
      const ethers = hre.ethers;
      const user = new ethers.Wallet(key, ethers.provider);
      const erc721= ERC721Upgradeable__factory.connect(nft, user);
      await (await erc721.setApprovalForAll(spender, true)).wait();
      console.log(`erc721:approve end`);
    }
  );

task("erc20:approve", "ERC20 approve")
  .addParam("pay", "payable Token")
  .addParam("key", "sender key")
  .addParam("spender", "Spender")
  .addParam("amount", "amount")
  .setAction(
    async (
      { pay, key, spender, amount }: any,
      hre: HardhatRuntimeEnvironment
    ) => {
      console.log(`erc20:approve start`);
      const ethers = hre.ethers;
      const user = new ethers.Wallet(key, ethers.provider);
      const erc20= ERC20__factory.connect(pay, user);
      console.log(
        `user balance is ${await erc20.balanceOf(await user.getAddress())}`
      );
      console.log(`user approve is ${ethers.parseEther(amount)}`);
      await (
        await erc20.approve(spender, ethers.parseEther(amount))
      ).wait();
      console.log(`erc20:approve end`);
    }
  );
