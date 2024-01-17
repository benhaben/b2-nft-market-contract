import { ethers, run  } from 'hardhat';
import { B2NFTFactory__factory, B2NFTMarketplace__factory, Token__factory } from "../typechain-types";


async function main() {

  const signers = await ethers.getSigners();
  const NFTFactory = new B2NFTFactory__factory(signers[0]);
  const b2NFTFactory = await NFTFactory.deploy();
  await b2NFTFactory.waitForDeployment();
  console.log('B2NFTFactory.sol deployed to: ', await b2NFTFactory.getAddress());



  const NFTMarketplaceFactory = new B2NFTMarketplace__factory(signers[0]);
  const platformFee = BigInt(10); // 10%
  const feeRecipient = signers[0].address;
  const b2NFTMarketplace =  await NFTMarketplaceFactory.deploy(platformFee, feeRecipient);
  await b2NFTMarketplace.waitForDeployment();
  console.log('B2NFTMarketplace deployed to: ', await b2NFTMarketplace.getAddress());

  const TokenFactory = new Token__factory(signers[0]);
  const name ='WBTC Token';
  const symbol = 'WBTC';
  const token = await TokenFactory.deploy(name, symbol);
  await token.waitForDeployment();
  console.log('TokenFactory deployed to: ', await token.getAddress());

  // await run(`verify:verify`, {
  //   address: await b2NFTFactory.getAddress(),
  //   constructorArguments: [],
  // });
  //
  // // https://abi.hashex.org/
  // await run(`verify:verify`, {
  //   address: await b2NFTMarketplace.getAddress(),
  //   constructorArguments: [platformFee, feeRecipient],
  // });
  //
  // await run(`verify:verify`, {
  //   address: await token.getAddress(),
  //   constructorArguments: [name, symbol],
  // });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;

})