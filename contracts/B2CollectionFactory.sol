// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./B2NFT.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./IB2CollectionFactory.sol";

/*
 Create new B2 NFT collection
 upgrade: https://mirror.xyz/xyyme.eth/VSyU0JfmVrcqN-F28tX5mzYjxFFAosl8tDAQX3vB5Dg
*/
contract B2CollectionFactory is IB2CollectionFactory, OwnableUpgradeable, PausableUpgradeable {
    // owner address => nft list
    mapping(address => address[]) private nfts;
    // active
    mapping(address => bool) private b2NFTs;

    mapping(address => uint256) private royaltyFees;
    mapping(address => address) private royaltyRecipients;

    event CreatedNFTCollection(
        address operator,
        address nft,
        address royaltyRecipient,
        uint256 royaltyFees
    );

    event ModifyNFTCollection(
        address operator,
        address nft,
        bool active
    );

    event ModifyRoyaltyFee(
        address operator,
        address nft,
        address royaltyRecipient,
        uint256 royaltyFees
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
        address _nft,
        address _royaltyRecipient,
        uint256 _royaltyFee
    ) external isERC721(_nft) whenNotPaused onlyOwner {
        nfts[msg.sender].push(address(_nft));
        b2NFTs[address(_nft)] = true;
        royaltyFees[_nft] = _royaltyFee;
        royaltyRecipients[_nft] = _royaltyRecipient;
        emit CreatedNFTCollection(msg.sender, address(_nft), _royaltyRecipient, _royaltyFee);
    }

    function modifyNFTCollection(
        address _nft,
        bool _active
    ) external isERC721(_nft) whenNotPaused onlyOwner {
        b2NFTs[address(_nft)] = _active;
        emit ModifyNFTCollection(msg.sender, address(_nft), _active);
    }

    function setRoyaltyFee(address _nft, uint256 _royaltyFee, address _royaltyRecipient) external whenNotPaused onlyOwner {
        require(_royaltyFee <= 10000, "can't more than 10 percent");
        require(_royaltyRecipient != address(0));

        royaltyFees[_nft] = _royaltyFee;
        royaltyRecipients[_nft] = _royaltyRecipient;
        emit ModifyRoyaltyFee(msg.sender, address(_nft), _royaltyRecipient, _royaltyFee);

    }

    function getOwnCollections() external view returns (address[] memory) {
        return nfts[msg.sender];
    }

    function getRoyaltyFee(address _nft) external view override(IB2CollectionFactory) returns (uint256) {
        return royaltyFees[_nft];
    }

    function getRoyaltyRecipient(address _nft) external override(IB2CollectionFactory) view returns (address) {
        return royaltyRecipients[_nft];
    }

    function isActive(address _nft) external override(IB2CollectionFactory) view returns (bool) {
        return b2NFTs[_nft];
    }

    // Reserved storage space to allow for layout changes in the future.
    uint256[41] private __gap;
}
