import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { B2NFT__factory } from "../../typechain-types";
import { EventLog } from "ethers";

task("mint", "mint nft")
  .addParam("key", "owner key")
  .addParam("nft", "nft address")
  .addParam("receiver", "receipt address")
  .addParam("uri", "https://ipfs.io/ip/somtheing")
  .setAction(async ({ key, nft, receiver,uri }: any, hre: HardhatRuntimeEnvironment) => {
    try {
      console.log(`key=${key}, nft=${nft}, receiver=${receiver}`);
      const ethers = hre.ethers;
      const network = hre.network;
      console.log(network.name);
      let b2NFT = B2NFT__factory.connect(nft,  new ethers.Wallet(key, ethers.provider));

      if (b2NFT) {
        const tx = await b2NFT.safeMint(receiver, uri);
        const receipt = await tx.wait();
        let log = receipt?.logs.find((log) => b2NFT.interface.parseLog(log as any)?.name === 'Transfer') as EventLog;
        console.log(`tokenId=${log.args.tokenId}`);
      }
    } catch (e) {
      console.log(e);
    }
  });
