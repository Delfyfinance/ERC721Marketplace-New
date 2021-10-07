pragma solidity 0.6.12;
// SPDX-License-Identifier: MIT;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract BASICNFT is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() public ERC721("BASIC NFT", "BASIC_NFT") {
        _setBaseURI("ipfs.io/ipfs/");
    }

    function mint(address _to, string memory tokenURI)
        external
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 newId = _tokenIds.current();
        _mint(_to, newId);
        _setTokenURI(newId, tokenURI);
        return newId;
    }

    function burn(uint256 _tokenId) external {
        require(
            _exists(_tokenId),
            "ERC721Metadata: can't burn nonexistent token"
        );
        address owner = ERC721.ownerOf(_tokenId);
        require(msg.sender == owner, "ERC721: only current owner");
        super._burn(_tokenId);
    }
}
