//SPDX-License-Identifier: MIT
pragma solidity ^0.6.8;

import "./SafeMath.sol";

contract ArborVote {

    using SafeMath for uint8;

    uint8 public argumentsCount = 0;

    enum Stage {
        Init,
        Debating,
        Voting,
        Counting,
        Done
    }
    Stage public currentStage = Stage.Init;

    uint public debatingStartTime;
    uint public votingStartTime;
    uint public countingStartTime;

    uint constant stageDurationBaseValue = 1 days;

    constructor (string memory _text) public {
        arguments[0] = Argument({ // Argument 0 is the proposal itself
            isSupporting: true, // makes no sense for the proposal - just set to true
            votes: 0,
            creator: msg.sender,
            ownId: 0,
            parentId: 0,
            text: _text,
            unfinalizedChildCount: 0,
            accumulatedChildVotes: 0,
            isFinalized: false
        });
        argumentsCount = 1; // start counting at one

        // Define the stage start times
        currentStage = Stage.Debating;
        debatingStartTime = now;
        votingStartTime = now + stageDurationBaseValue;
        countingStartTime = votingStartTime + stageDurationBaseValue;
    }

    function updateStage() public {
        if (now > countingStartTime)
            currentStage = Stage.Counting;
        else if (now > votingStartTime && currentStage < Stage.Voting) // prevents going back
            currentStage = Stage.Voting;
        else if (now > debatingStartTime && currentStage < Stage.Debating)
            currentStage = Stage.Debating;
    }

    /**
     * @notice Advance the stage of debate. Remove method in Production.
     */
    function advanceStage() public {
        if (currentStage == Stage.Debating) {
            votingStartTime = now;
            currentStage = Stage.Voting;
        }
        else if (currentStage == Stage.Voting) {
            countingStartTime = now;
            currentStage = Stage.Counting;
        }
    }

    //Each struct represents a node in tree
    struct Argument {
        bool isSupporting;
        int votes;

        address creator;
        uint8 ownId;
        uint8 parentId;
        string text;
        uint8 unfinalizedChildCount;
        int accumulatedChildVotes;  //child votes are zero or higher but we are keeping it int because it's easier
        bool isFinalized;
    }
    mapping ( uint8 => Argument ) public arguments;

    // Getters
    function addArgument(uint8 _parentId, string memory _text, bool _supporting) public {
        updateStage();
        require(currentStage == Stage.Debating);
        require(argumentsCount <= uint8(255), "There can't be more than 255 arguments.");

        // Create a child node and add it to the mapping
        arguments[argumentsCount] = Argument({
            isSupporting: _supporting,
            votes: 0,
            creator: msg.sender,
            ownId: argumentsCount,
            parentId: _parentId,
            text: _text,
            unfinalizedChildCount: 0,
            accumulatedChildVotes: 0,
            isFinalized: false
            }
        );
        
        argumentsCount = argumentsCount.add(1); //increment afterwards because the proposal itself has index zero

        // change parent state accordingly
        arguments[_parentId].unfinalizedChildCount = arguments[_parentId].unfinalizedChildCount.add(1);

        if (now > votingStartTime)
            currentStage = Stage.Voting;
    }

    function finalizeLeaves() public  {
        updateStage();
        require(currentStage == Stage.Counting);

        for (uint8 i = 0; i < argumentsCount; i++) {
            if(arguments[i].unfinalizedChildCount == 0)
                finalize(i,0);
        }
        currentStage = Stage.Done;
    }


    /* Finalizes the argument tree up to the highest possible parent argument and stops.
     * It stops, if the parent arguments contains children that haven't been finalized.
     * The finalize method can only be called from leaves (unfinalizedChildCount == 0) to ensure traversal from the bottom to the top.
     */
    function finalize(uint8 i, int accumulatedChildVotes) internal {

        arguments[i].accumulatedChildVotes += accumulatedChildVotes;
        if(arguments[i].unfinalizedChildCount > 1)
            arguments[i].unfinalizedChildCount = arguments[i].unfinalizedChildCount.sub(1);
        else {
            arguments[i].unfinalizedChildCount = 0; // all children are finalized
            arguments[i].isFinalized = true;
        }
        // The Argument is then equivalent to a leaf and its cumulative vote weight can be counted for the parent argument.

        if(arguments[i].ownId == 0) { // stop if root 0 is reached.
            arguments[0].isFinalized = true;
        } else if(arguments[i].unfinalizedChildCount == 0) { // all children were removed due to finalization
            arguments[i].isFinalized = true;
            int accumulatedVotes = arguments[i].votes+int(accumulatedChildVotes);

            if(accumulatedVotes > 0) { // argument is better than neutral
                if(arguments[i].isSupporting){
                    finalize(arguments[i].parentId, accumulatedVotes);
                } else {
                    finalize(arguments[i].parentId, -accumulatedVotes);
                }
            } else { // Don't count bad arguments
                finalize(arguments[i].parentId, 0);
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

    function getVoteTokens() public view returns (uint8) {
        return voters[msg.sender].voteTokens;
    }

    function join() external {
        updateStage();
        require(currentStage == Stage.Debating || currentStage == Stage.Voting );

        require(!voters[msg.sender].joined, "Joined already.");
        voters[msg.sender].joined = true;
        voters[msg.sender].voteTokens = INITIALVOTETOKENS;
    }

    function payForVote(address voterAddr, uint8 cost) internal {
        require(voters[voterAddr].voteTokens >= cost, "Insufficient vote tokens");
        voters[voterAddr].voteTokens = voters[voterAddr].voteTokens.sub(cost);
    }

    function quadraticCost(uint8 voteStrength) internal pure returns(uint8) {
        // quadratic voting
        require(voteStrength >= 1 && voteStrength <= 3, "Voting power can only range from 1 to 3");

        return voteStrength * voteStrength;
    }

    /// Events
    event Voted(address indexed entity, uint8 argumentId, uint8 voteStrength);

    function prepareVotum(uint8 id, uint8 voteStrength) internal {
        require(id != 0, "Voting directly on the root argument is prohibited.");
        require(currentStage == Stage.Voting);
        require(voters[msg.sender].joined == true, "Voter must join first");

        // pay
        uint8 cost = quadraticCost(voteStrength);
        payForVote(msg.sender, cost);
    }

    /**
     * @notice Vote for argument `id` with vote strength `voteStrength`
     * @param id ID of the argument to vote for
     */
    function voteFor(uint8 id, uint8 voteStrength) public {
        updateStage();
        prepareVotum(id, voteStrength);
        arguments[id].votes = arguments[id].votes + voteStrength;
        emit Voted(msg.sender, id, voteStrength);
    }

    /**
     * @notice Vote against argument `id` with vote strength `voteStrength`
     * @param id ID of the argument to vote against
     */
    function voteAgainst(uint8 id, uint8 voteStrength) public {
        updateStage();
        prepareVotum(id, voteStrength);
        arguments[id].votes = arguments[id].votes - voteStrength;
        emit Voted(msg.sender, id, voteStrength);
    }

    /* @notice refuses ether sent with no txData
     */
    receive() external payable { revert(); }

    /* @notice refuses ether sent with txData that
     * does not match any function signature in the contract
     */
    fallback() external {}
}
