//SPDX-License-Identifier: MIT

pragma solidity ^0.6.8;
pragma experimental ABIEncoderV2;

import "./SafeMath.sol";
import "./SignedSafeMath.sol";

contract ArborVote {

    using SafeMath8 for uint8;
    using SafeMath256 for uint256;
    using SignedSafeMath256 for int256;

    enum Stage {
        Init,
        Debating,
        Voting,
        Counting,
        Done
    }

    // Each struct represents a node in tree
    struct Argument {
        bool isSupporting;
        int256 votes;
        address creator;
        uint8 parentId;
        string text;
        uint8 unfinalizedChildCount;
        int256 accumulatedChildVotes;  // int256 for summing up con arguments as negative votes
        bool isFinalized;
    }

    struct Voter {
        uint8 voteTokens;
        bool joined;
        mapping (uint8 => bool) votedOnArgument;
    }

    // Events
    event Voted(address indexed entity, uint8 argumentId, int8 voteStrength);

    struct Debate {
        Stage currentStage;
        address creator;
        uint8 argumentsCount;
        mapping (uint8 => Argument) arguments;
        mapping (address => Voter) voters;
        uint8 initialVoteTokens;
        uint256 debatingStartTime;
        uint256 votingStartTime;
        uint256 countingStartTime;
        uint256 stageDuration;
    }
    uint256 public debatesCount;
    mapping ( uint256 => Debate ) public debates;


    constructor (string memory _text) public {
        uint256 stageDurationBaseValue = 1 days;
        debates[0] = Debate({ 
        currentStage: Stage.Debating,
        creator: msg.sender,
        argumentsCount: 1, // start counting at one
        initialVoteTokens: 12,
        debatingStartTime: now,
        stageDuration: stageDurationBaseValue,
        votingStartTime: now.add(stageDurationBaseValue),
        countingStartTime: now.add(stageDurationBaseValue).add(stageDurationBaseValue)
        });
        debatesCount = 1;
        debates[0].arguments[0] = Argument({ // Argument 0 is the proposal itself
            isSupporting: true, // makes no sense for the proposal - just set to true
            votes: 0,
            creator: msg.sender,
            parentId: 0,
            text: _text,
            unfinalizedChildCount: 0,
            accumulatedChildVotes: 0,
            isFinalized: false
        });
    }

    function updateStage(uint256 _debateId) public {
        Debate storage debate = debates[_debateId];
        if (now > debate.countingStartTime)
            debate.currentStage = Stage.Counting;
        else if (now > debate.votingStartTime && debate.currentStage < Stage.Voting) // prevents going back
            debate.currentStage = Stage.Voting;
        else if (now > debate.debatingStartTime && debate.currentStage < Stage.Debating)
            debate.currentStage = Stage.Debating;
    }

    function currentStage(uint256 _debateId) public view returns(Stage) {
        return debates[_debateId].currentStage;
    }

    /**
     * @notice Advance the stage of debate. Remove method in main-net.
     */
    function advanceStage(uint256 _debateId) public {
        Debate storage debate = debates[_debateId];
        if (debate.currentStage == Stage.Debating) {
            debate.votingStartTime = now;
            debate.currentStage = Stage.Voting;
        }
        else if (debate.currentStage == Stage.Voting) {
            debate.countingStartTime = now;
            debate.currentStage = Stage.Counting;
        }
    }

    function getArgument(uint256 _debateId, uint8 _argumentId) public view returns (Argument memory) {
        return debates[_debateId].arguments[_argumentId];
    }

    function addArgument(uint256 _debateId, uint8 _parentId, string memory _text, bool _supporting) public {
        updateStage(_debateId);
        Debate storage debate = debates[_debateId];
        require(debate.currentStage == Stage.Debating);
        require(debate.argumentsCount <= uint8(255), "There can't be more than 255 arguments.");

        // Create a child node and add it to the mapping
        debate.arguments[debate.argumentsCount] = Argument({
            isSupporting: _supporting,
            votes: 0,
            creator: msg.sender,
            parentId: _parentId,
            text: _text,
            unfinalizedChildCount: 0,
            accumulatedChildVotes: 0,
            isFinalized: false
            }
        );
        
        debate.argumentsCount = debate.argumentsCount.add(1); //increment afterwards because the proposal itself has index zero

        // change parent state accordingly
        debate.arguments[_parentId].unfinalizedChildCount = debate.arguments[_parentId].unfinalizedChildCount.add(1);

        if (now > debate.votingStartTime)
            debate.currentStage = Stage.Voting;
    }

    function finalizeLeaves(uint256 _debateId) public {
        updateStage(_debateId);
        Debate storage debate = debates[_debateId];
        require(debate.currentStage == Stage.Counting);

        for (uint8 i = 0; i < debate.argumentsCount; i++) {
            if(debate.arguments[i].unfinalizedChildCount == 0)
                finalize(_debateId, i, 0);
        }
        debate.currentStage = Stage.Done;
    }


    /* Finalizes the argument tree up to the highest possible parent argument and stops.
     * It stops, if the parent arguments contains children that haven't been finalized.
     * The finalize method can only be called from leaves (unfinalizedChildCount == 0) to ensure traversal from the bottom to the top.
     */
    function finalize(uint256 _debateId, uint8 _argumentId, int256 _accumulatedChildVotes) internal {
        Debate storage debate = debates[_debateId];
        Argument storage argument = debate.arguments[_argumentId];

        argument.accumulatedChildVotes = argument.accumulatedChildVotes.add(_accumulatedChildVotes);
        if(argument.unfinalizedChildCount > 1)
            argument.unfinalizedChildCount = argument.unfinalizedChildCount.sub(1);
        else {
            argument.unfinalizedChildCount = 0; // all children are finalized
            argument.isFinalized = true;
        }
        // The Argument is then equivalent to a leaf and its cumulative vote weight can be counted for the parent debate[_debateId].argument.

        if(_argumentId == 0) { // stop if root 0 is reached.
            debate.arguments[0].isFinalized = true;
        } else if(argument.unfinalizedChildCount == 0) { // all children were removed due to finalization
            argument.isFinalized = true;
            int256 accumulatedVotes = argument.votes.add(_accumulatedChildVotes);

            if(accumulatedVotes > 0) { // debate[_debateId].argument is better than neutral
                if(argument.isSupporting){
                    finalize(_debateId, argument.parentId, accumulatedVotes);
                } else {
                    finalize(_debateId, argument.parentId, -accumulatedVotes);
                }
            } else { // Don't count bad debate[_debateId].arguments
                finalize(_debateId, argument.parentId, 0);
            }
        }
    }


    uint8 public constant INITIALVOTETOKENS = 12;

    function getVoteTokens(uint256 _debateId) public view returns (uint8) {
        return debates[_debateId].voters[msg.sender].voteTokens;
    }

    modifier votable(uint256 _debateId, uint8 _argumentId) {
        require(debates[_debateId].voters[msg.sender].votedOnArgument[_argumentId] == false, "Voting is only allowed once per argument.");
        _;
        debates[_debateId].voters[msg.sender].votedOnArgument[_argumentId] = true;
    }

    function join(uint256 _debateId) external {
        updateStage(_debateId);
        Debate storage debate = debates[_debateId];
        require(debate.currentStage == Stage.Debating || debate.currentStage == Stage.Voting );

        Voter storage voter = debates[_debateId].voters[msg.sender];

        require(!voter.joined, "Joined already.");
        voter.joined = true;
        voter.voteTokens = INITIALVOTETOKENS;
    }

    function payForVote(uint256 _debateId, address voterAddr, uint8 cost) internal {
        Debate storage debate = debates[_debateId];
        require(debate.voters[voterAddr].voteTokens >= cost, "Insufficient vote tokens");
        debate.voters[voterAddr].voteTokens = debate.voters[voterAddr].voteTokens.sub(cost);
    }

    function quadraticCost(uint8 voteStrength) internal pure returns(uint8) {
        // quadratic voting
        require(voteStrength >= 1 && voteStrength <= 3, "Voting power can only range from 1 to 3");

        return voteStrength * voteStrength;
    }

    function prepareVotum(uint256 _debateId, uint8 _argumentId, uint8 _voteStrength) internal {
        require(_argumentId != 0, "Voting directly on the root argument is prohibited.");
        Debate storage debate = debates[_debateId];
        require(debate.currentStage == Stage.Voting);
        require(debate.voters[msg.sender].joined == true, "Voter must join first");

        // pay
        uint8 cost = quadraticCost(_voteStrength);
        payForVote(_debateId, msg.sender, cost);
    }

    /**
     * @notice Vote for argument `_argumentId` with vote strength `_voteStrength`
     * @param _argumentId ID of the argument to vote for
     */
    function voteFor(uint256 _debateId, uint8 _argumentId, uint8 _voteStrength) public votable(_debateId, _argumentId) {
        updateStage(_debateId);
        prepareVotum(_debateId, _argumentId, _voteStrength);
        Argument storage argument = debates[_debateId].arguments[_argumentId];
        argument.votes = argument.votes.add(_voteStrength);
        emit Voted(msg.sender, _argumentId, int8(_voteStrength));
    }

    /**
     * @notice Vote against argument `_argumentId` with vote strength `_voteStrength`
     * @param _argumentId ID of the argument to vote against
     */
    function voteAgainst(uint256 _debateId, uint8 _argumentId, uint8 _voteStrength) public votable(_debateId, _argumentId){
        updateStage(_debateId);
        prepareVotum(_debateId, _argumentId, _voteStrength);
        Argument storage argument = debates[_debateId].arguments[_argumentId];
        argument.votes = argument.votes.sub(_voteStrength);
        emit Voted(msg.sender, _argumentId, -int8(_voteStrength));
    }

    /* @notice refuses ether sent with no txData
     */
    receive() external payable { revert(); }

    /* @notice refuses ether sent with txData that
     * does not match any function signature in the contract
     */
    fallback() external {}
}
