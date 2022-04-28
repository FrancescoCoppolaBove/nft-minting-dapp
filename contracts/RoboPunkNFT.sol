// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract RoboPunksNFT is ERC721, Ownable {
    using SafeMath for uint256;
    using Strings for uint256;

    uint256 public mintPrice;

    uint256 public totalSupply;

    uint256 public maxSupply;

    uint256 public maxPerWallet;

    bool public isPublicMintEnabled;

    string internal baseTokenUri;

    address payable public withdrawWallet;

    mapping (address => uint256) public walletMints;

    constructor() payable ERC721('RoboPunks', 'RPC'){
        // Initialize variables in the costructor is cheaper
        mintPrice = 0.02 ether;
        totalSupply = 0;
        maxSupply = 1000;
        maxPerWallet = 3;
        // set withdraw address
    }

    function setIsPublicMintEnabled() external onlyOwner {
        isPublicMintEnabled = !isPublicMintEnabled;
    }

    function setBaseTokenUri(string calldata _baseTokenUri) external onlyOwner {
        baseTokenUri = _baseTokenUri;
    }

    function tokenURI(uint256 _tokenId) public view override returns (string memory){
        require(_exists(_tokenId), 'Token does not exist');
        return string(abi.encodePacked(baseTokenUri, Strings.toString(_tokenId), '.json'));
    }

    function withdraw() external onlyOwner {
        (bool success, ) = withdrawWallet.call{value: address(this).balance}('');
        require(success, 'withdraw failed');
    }

    function mint(uint _quantity) public payable {
        require(isPublicMintEnabled, 'Minting not Enabled');
        require(msg.value == _quantity * mintPrice, 'Wront mint value');
        require(totalSupply + _quantity <= maxSupply, 'Sold Out!');
        require(walletMints[msg.sender] + _quantity <= maxPerWallet, 'Exceed max wallet!');

        for(uint i=0; i < _quantity; i++){
            uint256 newTokenId = totalSupply + 1;
            totalSupply.add(1);
            _safeMint(msg.sender, newTokenId);
        }
    }
}