//SPDX-License-Identifier: MIT
pragma solidity >=0.6.8;

import "./ArborVote.sol";
import "@optionality.io/clone-factory/contracts/CloneFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ArborVoteFactory is Ownable, CloneFactory {

    address public libraryAddress;

    event ArborVoteCreated(address newArborVoteAddress);

    constructor (address _libraryAddress) public {
        libraryAddress = _libraryAddress;
    }

    function setLibraryAddress(address  _libraryAddress) public onlyOwner {
        libraryAddress = _libraryAddress;
    }

    using address_make_payable for address;
    function createArborVote(string memory _rootThesisText) public onlyOwner {
        address payable clone = createClone(libraryAddress).make_payable();
        ArborVote(clone).init(_rootThesisText);
        ArborVoteCreated(clone);
    }
}

// Taken from: https://solidity.readthedocs.io/en/v0.5.0/050-breaking-changes.html
library address_make_payable {
    function make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }
}