const { expect } = require("chai");
const { utils } = require('ethers').utils;

let arborVote;

before(async function () {
  const ArborVote = await ethers.getContractFactory("ArborVote");
  arborVote = await ArborVote.deploy("Trees are great!"); // id 0
  await arborVote.deployed();

  // join
  await arborVote.join();
  expect(await arborVote.getVoteTokens()).to.equal(12);

  // Layer 1
  await arborVote.addArgument(0, "1", true); // id 1
  await arborVote.addArgument(0, "2", false); // id 2

  // Layer 2
  await arborVote.addArgument(1, "1.1", true); // id 3
  await arborVote.addArgument(1, "1.2", false); // id 4
  await arborVote.addArgument(2, "2.1", true); // id 5

  // Layer 3
  await arborVote.addArgument(3, "1.1.1", true); // id 6
});

describe("Constructor", function() {
  it("should return the root thesis after the constructor was executed.", async function() {
    expect(await arborVote.getText(0)).to.equal("Trees are great!");
  });

  it('should set the stage to "Debating"', async function () {
    expect(await arborVote.getStage()).to.equal(1);
  });
});

describe("addArgument", function() {
  it("should assign the argument ids.", async function() {
    expect(await arborVote.getText(1)).to.equal("1");
    expect(await arborVote.getText(2)).to.equal("2");
    expect(await arborVote.getText(3)).to.equal("1.1");
    expect(await arborVote.getText(4)).to.equal("1.2");
    expect(await arborVote.getText(5)).to.equal("2.1");
    expect(await arborVote.getText(6)).to.equal("1.1.1");
  });

  it("should display arguments as pro and con arguments.", async function() {
    expect(await arborVote.getIsSupporting(1)).to.equal(true);
    expect(await arborVote.getIsSupporting(2)).to.equal(false);
    expect(await arborVote.getIsSupporting(3)).to.equal(true);
    expect(await arborVote.getIsSupporting(4)).to.equal(false);
    expect(await arborVote.getIsSupporting(5)).to.equal(true);
    expect(await arborVote.getIsSupporting(6)).to.equal(true);
  });

  it("should return the number of children.", async function() {
    expect(await arborVote.getUnfinalizedChildCount(0)).to.equal(2);
    expect(await arborVote.getUnfinalizedChildCount(1)).to.equal(2);
    expect(await arborVote.getUnfinalizedChildCount(2)).to.equal(1);
    expect(await arborVote.getUnfinalizedChildCount(3)).to.equal(1);
    expect(await arborVote.getUnfinalizedChildCount(4)).to.equal(0);
    expect(await arborVote.getUnfinalizedChildCount(5)).to.equal(0);
    expect(await arborVote.getUnfinalizedChildCount(6)).to.equal(0);
  });
});

describe("vote", function() {
  it("should change the number of votes and vote tokens left.", async function() {
    await arborVote.advanceStage();
    expect(await arborVote.getStage()).to.equal(2);

    // vote on arg 1
    expect(await arborVote.getVotes(1)).to.equal(0);
    await arborVote.voteFor(1, 2);
    expect(await arborVote.getVoteTokens()).to.equal(8);
    expect(await arborVote.getVotes(1)).to.equal(2);

    // vote on arg 2
    expect(await arborVote.getVotes(2)).to.equal(0);
    await arborVote.voteFor(2, 2);
    expect(await arborVote.getVoteTokens()).to.equal(4);
    expect(await arborVote.getVotes(2)).to.equal(2);

    await arborVote.voteAgainst(2, 1);
    expect(await arborVote.getVoteTokens()).to.equal(3);
    expect(await arborVote.getVotes(2)).to.equal(1);

    // vote on arg 1.1
    expect(await arborVote.getVotes(3)).to.equal(0);
    await arborVote.voteFor(3, 1);
    expect(await arborVote.getVoteTokens()).to.equal(2);
    expect(await arborVote.getVotes(2)).to.equal(1);

    // vote on arg 1.1.1
    expect(await arborVote.getVotes(6)).to.equal(0);
    await arborVote.voteAgainst(6, 1);
    expect(await arborVote.getVoteTokens()).to.equal(1);
    expect(await arborVote.getVotes(6)).to.equal(-1); // => bad argument, cumulative vote weight is 0
  });
});

describe("finalizeLeaves", function() {
  it("should finalize the arguments.", async function() {
    await arborVote.advanceStage();
    expect(await arborVote.getStage()).to.equal(3);

    await arborVote.finalizeLeaves();

    expect(await arborVote.getIsFinalized(6)).to.equal(true);
    expect(await arborVote.getIsFinalized(5)).to.equal(true);
    expect(await arborVote.getIsFinalized(4)).to.equal(true);
    expect(await arborVote.getIsFinalized(3)).to.equal(true);
    expect(await arborVote.getIsFinalized(2)).to.equal(true);
    expect(await arborVote.getIsFinalized(1)).to.equal(true);
    expect(await arborVote.getIsFinalized(0)).to.equal(true);
  });


  it("should accumulate the child votes correctly.", async function() {
    expect(await arborVote.getAccumulatedChildVotes(6)).to.equal(0);
    expect(await arborVote.getAccumulatedChildVotes(5)).to.equal(0);
    expect(await arborVote.getAccumulatedChildVotes(4)).to.equal(0);
    expect(await arborVote.getAccumulatedChildVotes(3)).to.equal(0); // Arg 1.1.1 is a bad argument and returns 0
    expect(await arborVote.getAccumulatedChildVotes(2)).to.equal(0);
    expect(await arborVote.getAccumulatedChildVotes(1)).to.equal(1);
    expect(await arborVote.getAccumulatedChildVotes(0)).to.equal(2);
  });

  it("should accumulate the votes correctly.", async function() {
    expect(await arborVote.getAccumulatedVotes(6)).to.equal(-1);
    expect(await arborVote.getAccumulatedVotes(5)).to.equal(0);
    expect(await arborVote.getAccumulatedVotes(4)).to.equal(0);
    expect(await arborVote.getAccumulatedVotes(3)).to.equal(1); // Arg 1.1.1 is a bad argument and returns 0
    expect(await arborVote.getAccumulatedVotes(2)).to.equal(1);
    expect(await arborVote.getAccumulatedVotes(1)).to.equal(3);
    expect(await arborVote.getAccumulatedVotes(0)).to.equal(2);
  });
});