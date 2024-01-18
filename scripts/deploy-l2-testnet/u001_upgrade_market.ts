import { ethers, upgrades } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const admin = deployer;

  const marketAddress = "0x3EF7089D6D10E54Ff466fC74E2f165BE71046B1C";

  const B2NFTMarketplace = await ethers.getContractFactory("B2NFTMarketplace", {
    signer: deployer
  })

  console.log("Upgrading market contract...");
  await upgrades.upgradeProxy(marketAddress, B2NFTMarketplace);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
