# :full_moon:  Marketplace
---
NFT marketplace Smart Contract.

---

## :rocket: Features
* :hammer: Create a new ERC721 collection.
    - :fuelpump: Support setting royalty fees.
* :star: Sell (list item) NFT on the marketplace.
* :star2: Offer listed items on the marketplace.
* :sparkles: Accept an offer on the marketplace.
* :boom: Create an auction on the marketplace.
* :fire: Bid place to auction.
* :european_castle: (Marketplace owner) Support set and update payable token, platform fee.

## Deploy Kuiper Marketplace Smart Contract

1. Install packages.
```bash
npm install
```

2. Compile Smart Contract
```bash
cross-env NODE_ENV=l2 npx hardhat compile --network l2
```
if compile fail with ts import error, comment requre(task) in hardhat.config.ts

3. Deploy Smart Contarct
```bash
cross-env NODE_ENV=l2 npx hardhat run scripts/deploy.ts --network l2
```
4. Test Smart Contract
```bash
npx hardhat test --network <network>
```

5. create collection
```
cross-env NODE_ENV=l2 npx hardhat --network l2 createCollection --royaltyrecipient <address>
```
6. mint nft
```
   cross-env NODE_ENV=l2  npx hardhat --network l2 mint --receipt <address>
```

7. addPayableToken
```
   cross-env NODE_ENV=l2 npx hardhat --network l2 addPayableToken --pay <address>
```

8. set fee
```
   cross-env NODE_ENV=l2 npx hardhat --network l2 setRoyaltyFee --nft <address>
```

9. list nft
```
   cross-env NODE_ENV=l2 npx hardhat --network l2 list --pay <address> --market <address> --token <address> --price <amount> --id <id> --key <key>
```
modify list

```
   cross-env NODE_ENV=l2 npx hardhat --network l2 list --pay <address> --market <address>  --price <amount> --id <id> --key <key>
```

10. buy nft
```
   npx hardhat --network l2 buy --pay <address> --market <address> --nft <address> --price <amount> --id <id> --key <address>
```

11. flatten & verify
```
    npx hardhat flat 
```
b2 can only flatten with single file mod.

