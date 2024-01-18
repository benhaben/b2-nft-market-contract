import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { before } from "mocha";
import {
  B2NFT, B2NFTMarketplace,
  Token__factory, IERC20, B2CollectionFactory
} from "../typechain-types";
import { EventLog, Signer } from "ethers";


function toWei(value: number) {
  return ethers.parseEther(value.toString());
}


describe("B2 Marketplace", () => {

  let nft: B2NFT;
  let b2CollectionFactory: B2CollectionFactory;
  let marketplace: B2NFTMarketplace;
  let deployer: Signer;
  let admin: Signer;
  let collectionCreator: Signer;
  let buyer: Signer;
  let offerer: Signer;
  let bidder: Signer;
  let nftFeeRecipient: Signer;
  let platformFeeRecipient: Signer;
  let payableToken: IERC20;

  before(async () => {
    [deployer, admin, collectionCreator, buyer, offerer, bidder, nftFeeRecipient, platformFeeRecipient] = await ethers.getSigners();

    // Load contract factories without external libraries
    const [
      B2MarketplaceFactory,
      B2NFTFactory,
      B2CollectionFactory
    ] = await Promise.all(
      ["B2NFTMarketplace", "B2NFT", "B2CollectionFactory"].map(
        (contractName) => ethers.getContractFactory(contractName, deployer)
      )
    );

    b2CollectionFactory = await upgrades.deployProxy(
      B2CollectionFactory,
      [
        await admin.getAddress()
      ],
      {
        initializer: "initialize"
      }
    ) as unknown as B2CollectionFactory;
    await b2CollectionFactory.waitForDeployment();
    expect(await b2CollectionFactory.getAddress()).not.eq(null, "Deploy b2NFTFactory is failed.");

    const platformFee = BigInt(10); // 10%
    const feeRecipient = await platformFeeRecipient.getAddress();
    marketplace = await upgrades.deployProxy(
      B2MarketplaceFactory,
      [
        await admin.getAddress(),
        platformFee,
        feeRecipient
      ],
      {
        initializer: "initialize"
      }
    ) as unknown as B2NFTMarketplace;
    await marketplace.waitForDeployment();
    expect(await marketplace.getAddress()).not.eq(null, "Deploy marketplace is failed.");

    const Token = new Token__factory(deployer);
    payableToken = await Token.deploy("B2 Token", "WBTC");
    await payableToken.waitForDeployment();
    const payableTokenAddress = await payableToken.getAddress();
    expect(payableTokenAddress).not.eq(null, "Deploy test payable token is failed.");

    await marketplace.connect(admin).addPayableToken(payableTokenAddress);
    expect(await marketplace.checkIsPayableToken(payableTokenAddress), "Add payable token is failed.").to.true;

    // Transfer payable token to tester
    const buyerAddress = await buyer.getAddress();
    const offererAddress = await offerer.getAddress();
    await payableToken.connect(deployer).transfer(buyerAddress, toWei(1000000));
    expect(await payableToken.balanceOf(buyerAddress)).to.eq(toWei(1000000));
    await payableToken.connect(deployer).transfer(offererAddress, toWei(1000000));
    expect(await payableToken.balanceOf(offererAddress)).to.eq(toWei(1000000));


    nft = await upgrades.deployProxy(
      B2NFTFactory,
      [
        await collectionCreator.getAddress(),
        "Mask", "Mask"
      ],
      {
        initializer: "initialize"
      }
    ) as unknown as B2NFT;
    await nft.waitForDeployment();
    const nftAddress = await nft.getAddress();

    const tx = await b2CollectionFactory.connect(collectionCreator).createNFTCollection(nftAddress, "B2 Collection", "B2", "uri");
    const receipt = await tx.wait();
    let log = receipt?.logs.find((log) => b2CollectionFactory.interface.parseLog(log as any)?.name === "CreatedNFTCollection") as EventLog;
    const collectionAddress = log.args.nft;

    expect(nftAddress).not.eq(null, "Create collection is failed.");
    await marketplace.connect(admin).setRoyaltyFee(nftAddress, BigInt(1000), nftFeeRecipient);
  });

  describe("List and Buy", () => {
    const tokenId = 0;

    it("Creator should mint NFT", async () => {
      const to = await collectionCreator.getAddress();
      const uri = "B2.io";
      const id = await nft.connect(collectionCreator).safeMint(to, uri);
      expect(await nft.ownerOf(tokenId)).to.eq(to, "Mint NFT is failed.");
    });

    it("Creator should list NFT on the marketplace", async () => {
      await nft.connect(collectionCreator).approve(await marketplace.getAddress(), tokenId);
      const tx = await marketplace.connect(collectionCreator).listNft(await nft.getAddress(), BigInt(tokenId), await payableToken.getAddress(), toWei(100000));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "ListedNFT") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      expect(eventNFT).eq(await nft.getAddress(), "NFT is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Creator should modify listed item", async () => {
      const modifyPrice = toWei(333);
      await expect(
         marketplace.connect(buyer).modifyListedNFT(await nft.getAddress(), tokenId, modifyPrice)
      ).to.be.revertedWith("not listed owner")
      const tx =await marketplace.connect(collectionCreator).modifyListedNFT(await nft.getAddress(), tokenId, modifyPrice);
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "ModifyListedNFT") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const price = log.args.price;
      expect(eventNFT).eq(await nft.getAddress(), "NFT is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
      expect(price).eq(modifyPrice, "Price is wrong.");
    });

    it("Creator should cancel listed item", async () => {
      const tx =await marketplace.connect(collectionCreator).cancelListedNFT(await nft.getAddress(), tokenId);
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "cancelListedNFT") as EventLog;
      expect(await nft.ownerOf(tokenId)).eq(await collectionCreator.getAddress(), "Cancel listed item is failed.");
    });



    it("Creator should list NFT on the marketplace again!", async () => {
      await nft.connect(collectionCreator).approve(await marketplace.getAddress(), tokenId);
      const tx = await marketplace.connect(collectionCreator).listNft(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(100000));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "ListedNFT") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      expect(eventNFT).eq(await nft.getAddress(), "NFT is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Buyer should buy listed NFT", async () => {
      const tokenId = 0;
      const buyPrice = 100001;
      await payableToken.connect(buyer).approve(await marketplace.getAddress(), toWei(buyPrice));
      await marketplace.connect(buyer).buyNFT(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(buyPrice));
      expect(await nft.ownerOf(tokenId)).eq(await buyer.getAddress(), "Buy NFT is failed.");
      expect(await payableToken.balanceOf(await nftFeeRecipient.getAddress())).eq(toWei(buyPrice) / BigInt(10));
      expect(await payableToken.balanceOf(await platformFeeRecipient.getAddress())).eq(toWei(buyPrice) / BigInt(1000));
    });
  });

  describe("List, Offer, and Accept Offer", () => {
    const tokenId = 1;
    it("Creator should mint NFT", async () => {
      const to = await collectionCreator.getAddress();
      const uri = "B2.io";
      await nft.connect(collectionCreator).safeMint(to, uri);
      expect(await nft.ownerOf(tokenId)).to.eq(to, "Mint NFT is failed.");
    });

    it("Creator should list NFT on the marketplace", async () => {

      await nft.connect(collectionCreator).approve(await marketplace.getAddress(), tokenId);
      const tx = await marketplace.connect(collectionCreator).listNft(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(100000));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "ListedNFT") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      expect(eventNFT).eq(await nft.getAddress(), "NFT is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Buyer should offer NFT", async () => {
      const offerPrice = 1000;
      await payableToken.connect(buyer).approve(await marketplace.getAddress(), toWei(offerPrice));
      const tx = await marketplace.connect(buyer).offerNFT(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(offerPrice));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "OfferredNFT") as EventLog;
      const eventOfferer = log.args.offerer;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      expect(eventOfferer).eq(await buyer.getAddress(), "Offerer address is wrong.");
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Buyer should cancel offer", async () => {
      const tx = await marketplace.connect(buyer).cancelOfferNFT(await nft.getAddress(), tokenId);
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "CanceledOfferredNFT") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const eventOfferer = log.args.offerer;
      expect(eventOfferer).eq(await buyer.getAddress(), "Offerer address is wrong.");
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Offerer should offer NFT", async () => {
      const offerPrice = 1000;
      await payableToken.connect(offerer).approve(await marketplace.getAddress(), toWei(offerPrice));
      const tx = await marketplace.connect(offerer).offerNFT(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(offerPrice));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "OfferredNFT") as EventLog;
      const eventOfferer = log.args.offerer;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      expect(eventOfferer).eq(await offerer.getAddress(), "Offerer address is wrong.");
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Creator should accept offer", async () => {
      await marketplace.connect(collectionCreator).acceptOfferNFT(await nft.getAddress(), tokenId, await offerer.getAddress());
      expect(await nft.ownerOf(tokenId)).eq(await offerer.getAddress());
    });
  });

  describe("Create Auction, bid place, and Result auction", async () => {
    const tokenId = 2;
    it("Creator should mint NFT", async () => {
      const to = await collectionCreator.getAddress();
      const uri = "B2.io";
      await nft.connect(collectionCreator).safeMint(to, uri);
      expect(await nft.ownerOf(tokenId)).to.eq(to, "Mint NFT is failed.");
    });

    it("Creator should create auction", async () => {
      const price = 10000;
      const minBid = 500;
      const startTime = Date.now() + 60 * 60 * 24; // a day
      const endTime = Date.now() + 60 * 60 * 24 * 7; // 7 days
      await nft.connect(collectionCreator).approve(await marketplace.getAddress(), tokenId);
      const tx = await marketplace.connect(collectionCreator).createAuction(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(price), toWei(minBid), BigInt(startTime), BigInt(endTime));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "CreatedAuction") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const eventCreator = log.args.creator;
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventCreator).eq(await collectionCreator.getAddress(), "Creator address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Creator should cancel auction", async () => {
      await marketplace.connect(collectionCreator).cancelAuction(await nft.getAddress(), tokenId);
      expect(await nft.ownerOf(tokenId)).eq(await collectionCreator.getAddress(), "Cancel is failed.");
    });

    it("Creator should create auction again", async () => {
      const price = 10000;
      const minBid = 500;
      const startTime = 0; // now
      const endTime = Date.now() + 60 * 60 * 24 * 7; // 7 days
      await nft.connect(collectionCreator).approve(await marketplace.getAddress(), tokenId);
      const tx = await marketplace.connect(collectionCreator).createAuction(await nft.getAddress(), tokenId, await payableToken.getAddress(), toWei(price), toWei(minBid), BigInt(startTime), BigInt(endTime));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "CreatedAuction") as EventLog;

      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const eventCreator = log.args.creator;
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventCreator).eq(await collectionCreator.getAddress(), "Creator address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Buyer should bid place", async () => {
      const bidPrice = 10500;
      await payableToken.connect(buyer).approve(await marketplace.getAddress(), toWei(bidPrice));
      const tx = await marketplace.connect(buyer).bidPlace(await nft.getAddress(), tokenId, toWei(bidPrice));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "PlacedBid") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const eventBidder = log.args.bidder;
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventBidder).eq(await buyer.getAddress(), "Bidder address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Offerer should bid place", async () => {
      const bidPrice = 11000;
      await payableToken.connect(offerer).approve(await marketplace.getAddress(), toWei(bidPrice));
      const tx = await marketplace.connect(offerer).bidPlace(await nft.getAddress(), tokenId, toWei(bidPrice));
      const receipt = await tx.wait();
      let log = receipt?.logs.find((log) => marketplace.interface.parseLog(log as any)?.name === "PlacedBid") as EventLog;
      const eventNFT = log.args.nft;
      const eventTokenId = log.args.tokenId;
      const eventBidder = log.args.bidder;
      expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
      expect(eventBidder).eq(await offerer.getAddress(), "Bidder address is wrong.");
      expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
    });

    it("Marketplace deployer should call result auction", async () => {
      try {
        const tx = await marketplace.connect(deployer).resultAuction(await nft.getAddress(), tokenId);
        const receipt = await tx.wait();
        const events = receipt?.logs?.filter((e: any) => e.event == "ResultedAuction") as any;
        const eventNFT = events[0].args.nft;
        const eventTokenId = events[0].args.tokenId;
        const eventWinner = events[0].args.winner;
        const eventCaller = events[0].args.caller;
        expect(eventNFT).eq(await nft.getAddress(), "NFT address is wrong.");
        expect(eventTokenId).eq(tokenId, "TokenId is wrong.");
        expect(eventWinner).eq(await offerer.getAddress(), "Winner address is wrong.");
        expect(eventCaller).eq(await deployer.getAddress(), "Caller address is wrong.");
        expect(await nft.ownerOf(tokenId)).eq(eventWinner, "NFT deployer is wrong.");
      } catch (error) {

      }
    });
  });

});
