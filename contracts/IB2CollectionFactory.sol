// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IB2CollectionFactory {
    function isActive(address _nft) external view returns (bool);

    function getRoyaltyFee(address _nft) external view returns (uint256);

    function getRoyaltyRecipient(address _nft) external view returns (address);
}