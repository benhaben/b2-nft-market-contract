// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./B2NFT.sol";

/*
 Create new B2 NFT collection
*/
contract B2NFTFactory {
    // owner address => nft list
    mapping(address => address[]) private nfts;

    mapping(address => bool) private b2NFTs;

    mapping(address => string) private urls;

    event CreatedNFTCollection(
        address creator,
        address nft,
        string name,
        string symbol,
        string _uri
    );

    function createNFTCollection(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) external {
        B2NFT nft = new B2NFT(
            _name,
            _symbol,
            msg.sender
        );
        nfts[msg.sender].push(address(nft));
        b2NFTs[address(nft)] = true;
        urls[address(nft)] = _uri;
        emit CreatedNFTCollection(msg.sender, address(nft), _name, _symbol, _uri);
    }

    function getOwnCollections() external view returns (address[] memory) {
        return nfts[msg.sender];
    }

    function isB2NFT(address _nft) external view returns (bool) {
        return b2NFTs[_nft];
    }
}
