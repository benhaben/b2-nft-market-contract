// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./B2NFT.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

/*
 Create new B2 NFT collection
*/
contract B2CollectionFactory is OwnableUpgradeable ,PausableUpgradeable{
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

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) initializer public {
        __Pausable_init();
        __Ownable_init(initialOwner);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    bytes4 constant IERC721_InterfaceId = 0x80ac58cd;

    modifier isERC721(address _addr) {
        address implementer = _addr;
        bytes4 interfaceId = IERC721_InterfaceId;

        // 调用supportsInterface方法判断
        (bool success,) = implementer.call(abi.encodeWithSelector(IERC165.supportsInterface.selector, interfaceId));
        require(
            success,
            "not ERC721"
        );
        _;
    }

    function createNFTCollection(
         address nft,
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) external isERC721(nft) whenNotPaused{
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

    // Reserved storage space to allow for layout changes in the future.
    uint256[41] private __gap;
}
