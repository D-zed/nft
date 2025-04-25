// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTMarketplace is Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;

    uint256 listPrice = 0.01 ether;
    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    mapping(uint256 => ListedToken) private idToListedToken;

    struct ListedToken {
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed; //上架状态
    }

    event TokenListedSuccess(
        uint256 indexed tokenId,
        address owner,
        address seller,
        uint256 price,
        bool currentlyListed //上架状态
    );

    constructor() Ownable() ERC721("NFTMarketplace", "NFTM") {}

    // owner
    function updateListedPrice(uint256 _listPrice) public onlyOwner {
        listPrice = _listPrice;
    }

    // seller

    function createToken(
        string calldata tokenURI,
        uint256 price
    ) external payable returns (uint256) {
        require(price > 0, "price must greater than zero");
        require(msg.value == listPrice, "must pay for listing");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        /*
        uint256 tokenId;
        address payable owner;
        address payable seller;
        uint256 price;
        bool currentlyListed; //上架状态
        */
        idToListedToken[newTokenId] = ListedToken(
            newTokenId,
            payable(address(this)),
            payable(msg.sender),
            price,
            true //上架状态
        );
        //function _transfer(address from, address to, uint256 tokenId) internal
        _transfer(msg.sender, address(this), newTokenId);

        emit TokenListedSuccess(
            newTokenId,
            address(this),
            msg.sender,
            price,
            true //上架状态
        );
        return newTokenId;
    }

    //buyers
    function executeSale(uint256 tokenId) public payable {
        ListedToken storage token = idToListedToken[tokenId];
        require(token.currentlyListed, "not listed");
        require(msg.value == token.price,"value not enough");
        address tokenOwnerAdress = ownerOf(tokenId);
        require(tokenOwnerAdress!=address(0),"check tokenId");
        address payable seller = token.seller;
        token.seller = payable(msg.sender);
        _transfer(tokenOwnerAdress,msg.sender,tokenId);
        seller.transfer(token.price);
        payable(owner()).transfer(listPrice);
        _itemsSold.increment();
    }

    //extend

    function getAllNFTs() external view returns (ListedToken[] memory) {
        ListedToken[] memory resp = new ListedToken[](_tokenIds.current());
        for (uint i = 1; i <= resp.length; i++) {
            ListedToken memory item = idToListedToken[i];
            //在 Solidity 中，​​内存（memory）数组不支持 push 方法​
            // resp.push(item);
            resp[i - 1] = item;
        }
        return resp;
    }

    ///
    function getMyNFTs() external view returns (ListedToken[] memory) {
        uint count = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (
                idToListedToken[i].seller == payable(msg.sender) ||
                idToListedToken[i].owner == payable(msg.sender)
            ) {
                count += 1;
            }
        }
        ListedToken[] memory resp = new ListedToken[](count);
        uint c = 0;
        for (uint256 i = 1; i <= _tokenIds.current(); i++) {
            if (
                idToListedToken[i].seller == payable(msg.sender) ||
                idToListedToken[i].owner == payable(msg.sender)
            ) {
                resp[c] = idToListedToken[i];
                c++;
            }
        }
        return resp;
    }

    function getLastIdToListedToken() external view returns (uint256) {
        return _tokenIds.current();
    }

    function getListedTokenForId(
        uint256 _tokenId
    ) external view returns (ListedToken memory) {
        return idToListedToken[_tokenId];
    }

    function getCurrentToken() external view returns (ListedToken memory) {
        return idToListedToken[_tokenIds.current()];
    }

    function getListPrice() external view returns (uint256) {
        return listPrice;
    }
}
