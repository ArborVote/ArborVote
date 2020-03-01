pragma solidity >=0.4.22 <0.7.0;


contract Debate {
    uint8 public constant INITIALVOTETOKENS = 12;
    uint8 argumentsCount;

    constructor (string memory _text) public{
        arguments[0] = Argument({ // Argument 0 is the debate itself
            // makes no sense in this context - just use some default values
            supporting: true,
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

    //Each struct represents a node is the discussion tree
    struct Argument {
        bool supporting;
        int votes;

        address creator;
        uint8 ownId;
        uint8 parentId;
        string text;
        uint numberOfChildren;
        int childVotes;  //child votes are zero or higher but we are keeping int because it's easier
        bool isFinalized;

    }
    mapping ( uint8 => Argument ) public arguments;
    uint8 totalArgumentsCount = 0;

    function getText(uint8 id) public view returns (string memory) {
        return arguments[id].text;
    }

    function addArgument(uint8 _parentId, string memory _text, bool _supporting) public payable {
        require(argumentsCount <= uint8(255), "There can't be more than 255 subarguments.");

        totalArgumentsCount++; //incrementing mapping uint first so that the debate thesis is the zero index

        // Create a child node and add to mapping of nodes
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

    /*
    Calls the subArgumentIsFinalized() in the hierarchy level.
    Can only be called from leafs to ensure traversal from bottom to the top.
    */
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

        return voteStrength*voteStrength;
    }

    function voteFor(uint8 i, uint8 voteStrength) public {
        uint8 cost = quadraticCost(voteStrength);
        payForVote(msg.sender, cost);
        arguments[i].votes += voteStrength;
    }

    function voteAgainst(uint8 i, uint8 voteStrength) public {
        uint8 cost = quadraticCost(voteStrength);
        payForVote(msg.sender, cost);
        arguments[i].votes -= voteStrength;
    }
}
