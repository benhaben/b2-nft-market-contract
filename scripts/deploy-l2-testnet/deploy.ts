import { ethers, run, upgrades } from "hardhat";
import { Token__factory } from "../../typechain-types";
import { B2NFT } from "../../typechain-types";
import { B2CollectionFactory } from "../../typechain-types";
import { B2NFTMarketplace } from "../../typechain-types";

let nft: B2NFT;
let b2CollectionFactory: B2CollectionFactory;
let marketplace: B2NFTMarketplace;

async function main() {

  // const [deployer, admin, collectionCreator, buyer, offerer, bidder, nftFeeRecipient, platformFeeRecipient] = await ethers.getSigners();

  const [deployer] = await ethers.getSigners();

  const [
    B2MarketplaceFactory,
    B2NFTFactory,
    B2CollectionFactory
  ] = await Promise.all(
    ["B2NFTMarketplace", "B2NFT", "B2CollectionFactory"].map(
      (contractName) => ethers.getContractFactory(contractName, deployer)
    )
  );
  const deployerAddress = await deployer.getAddress();
  b2CollectionFactory = (await upgrades.deployProxy(B2CollectionFactory, [deployerAddress], {
    initializer: "initialize"
  })) as unknown as B2CollectionFactory;

  console.log("B2CollectionFactory.sol deployed to: ", await b2CollectionFactory.getAddress());

  const platformFee = BigInt(10); // 10%
  const feeRecipient = await deployer.getAddress();
  marketplace = (await upgrades.deployProxy(B2MarketplaceFactory, [await b2CollectionFactory.getAddress(), deployerAddress, platformFee, feeRecipient], {
    initializer: "initialize"
  })) as unknown as B2NFTMarketplace;
  console.log("B2NFTMarketplace deployed to: ", await marketplace.getAddress());

  nft = (await upgrades.deployProxy(B2NFTFactory, [deployerAddress,
    "Mask", "Mask"], {
    initializer: "initialize"
  })) as unknown as B2NFT;
  const nftAddress = await nft.getAddress();
  console.log("NFT deployed to: ", nftAddress);

  const TokenFactory = new Token__factory(deployer);
  const name = "WBTC Token";
  const symbol = "WBTC";
  const token = await TokenFactory.deploy(name, symbol);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("TokenFactory deployed to: ", tokenAddress);

  console.log(`create collection nft and set fee`);
  await b2CollectionFactory.createNFTCollection(await nft.getAddress(), deployer, BigInt(1000));

  console.log(`Add pay token for nft`);
  await marketplace.connect(deployer).addPayableToken(tokenAddress);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;

});