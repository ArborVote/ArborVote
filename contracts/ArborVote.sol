//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

contract ArborVote {
    /// State
    uint8 public argumentsCount = 0;

    constructor (string memory _text) public {
        arguments[0] = Argument({ // Argument 0 is the proposal itself
            supporting: true, // makes no sense for the proposal - just set to true
            votes: 0,
            creator: msg.sender,
            ownId: 0,
            parentId: 0,
            text: _text,
            numberOfChildren: 0,
            childVotes: 0,
            isFinalized: false
        });
        argumentsCount = 1; // start counting at one
    }

    //Each struct represents a node in tree
    struct Argument {
        bool supporting;
        int votes;

        address creator;
        uint8 ownId;
        uint8 parentId;
        string text;
        uint numberOfChildren;
        int childVotes;  //child votes are zero or higher but we are keeping it int because it's easier
        bool isFinalized;
    }
    mapping ( uint8 => Argument ) public arguments;
    uint8 totalArgumentsCount = 0;

    function getVotes(uint8 id) public view returns (int) {
        return arguments[id].votes;
    }

    function getText(uint8 id) public view returns (string memory) {
        return arguments[id].text;
    }

    function addArgument(uint8 _parentId, string memory _text, bool _supporting) public payable {
        require(argumentsCount <= uint8(255), "There can't be more than 255 subarguments.");

        totalArgumentsCount++; //increment first because the proposal itself has index zero

        // Create a child node and add it to the mapping
        arguments[totalArgumentsCount] = Argument({
            supporting: _supporting,
            votes: 0,
            creator: msg.sender,
            ownId: argumentsCount,
            parentId: _parentId,
            text: _text,
            numberOfChildren: 0,
            childVotes: 0,
            isFinalized: false
            }
        );

        // change parent state accordingly
        arguments[_parentId].numberOfChildren++;
    }

    function finalizeLeafs() public  {
        for (uint8 i = 0; i < totalArgumentsCount; i++) {
            if(arguments[i].numberOfChildren == 0)
                finalize(i,0);
        }
    }


    // Finalizes the argument tree up to the largest possible node.
    // Finalization requires all childs nodes to be finalized.
    // The finalize method can only be called from leafs (numberOfChildren == 0) to ensure traversal from the bottom to the top.
    function finalize(uint8 i, int childVotes) internal {

        Argument memory argument = arguments[i];
        argument.childVotes += childVotes;
        argument.numberOfChildren--;

        if(argument.ownId == 0) { // stop if argument 0 is reached.
            return;
        } else if(argument.numberOfChildren == 0) { // all children were removed due to finalization
            argument.isFinalized = true;
            int accumulatedVotes = argument.votes+int(childVotes);

            if(accumulatedVotes > 0) { // argument is better than neutral
                if(argument.supporting){
                    finalize(arguments[i].parentId, accumulatedVotes);
                } else {
                    finalize(arguments[i].parentId, -accumulatedVotes);
                }
            } else { // Don't count bad arguments
                finalize(argument.parentId, 0);
            }
        }
    }

    /********** VOTING RELATED ************/

    uint8 public constant INITIALVOTETOKENS = 12;

    struct Voter {
        uint8 voteTokens;
        bool joined;
    }
    mapping (address => Voter) public voters;

    function join() external {
        require(!voters[msg.sender].joined, "Joined already.");
        voters[msg.sender].joined = true;
        voters[msg.sender].voteTokens = INITIALVOTETOKENS;
    }

    function payForVote(address voterAddr, uint8 cost) internal {
        require(voters[voterAddr].voteTokens >= cost, "Insufficient vote tokens");
        voters[voterAddr].voteTokens -= cost;
    }

    function quadraticCost(uint8 voteStrength) internal pure returns(uint8) {
        // quadratic voting
        require(voteStrength >= 1 && voteStrength <= 3, "Voting power can only range from 1 to 3");

        return voteStrength * voteStrength;
    }

    /// Events
    event Voted(address indexed entity, uint8 argumentId, uint8 voteStrength);


    /**
     * @notice Vote for argument `id` with vote strength `voteStrength`
     * @param id ID of the argument to vote for
     */
    function voteFor(uint8 id, uint8 voteStrength) public {
        require(voters[msg.sender].joined == true, "Voter must join first");
        uint8 cost = quadraticCost(voteStrength);
        payForVote(msg.sender, cost);
        arguments[id].votes += voteStrength;
        emit Voted(msg.sender, id, voteStrength);
    }

    /**
     * @notice Vote against argument `id` with vote strength `voteStrength`
     * @param id ID of the argument to vote against
     */
    function voteAgainst(uint8 id, uint8 voteStrength) public {
        require(voters[msg.sender].joined == true, "Voter must join first");
        uint8 cost = quadraticCost(voteStrength);
        payForVote(msg.sender, cost);
        arguments[id].votes -= voteStrength;
        emit Voted(msg.sender, id, voteStrength);
    }
}
