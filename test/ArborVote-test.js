const {expect} = require("chai");
const {utils} = require('ethers').utils;

let arborVote;

before(async function () {
  const ArborVote = await ethers.getContractFactory("ArborVote");
  arborVote = await ArborVote.deploy("Trees are great!"); // id 0
  await arborVote.deployed();

  // join
  await arborVote.join();

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

describe("ArborVote", function () {
  it('should have a number of initial vote tokens equal to 12.', async function () {
    expect(await arborVote.INITIALVOTETOKENS()).to.equal(12);
  });

  it("should return the root thesis after the constructor was executed.", async function () {
    const root = await arborVote.arguments(0);
    expect(await root.text).to.equal("Trees are great!");
  });

  it('should set the stage to "Debating" after initializatiob', async function () {
    expect(await arborVote.currentStage()).to.equal(1);
  });

  it("should assign the argument ids.", async function () {
    for (let arr of [[1, "1"], [2, "2"], [3, "1.1"], [4, "1.2"], [5, "2.1"], [6, "1.1.1"]]) {
      let id = arr[0], expected = arr[1];
      const arg = await arborVote.arguments(id);
      expect(arg.text).to.equal(expected);
    }
  });

  it("should display arguments as pro and con arguments.", async function () {

    for (let arr of [[1, true], [2, false], [3, true], [4, false], [5, true], [6, true]]) {
      let id = arr[0], expected = arr[1];
      const arg = await arborVote.arguments(id);
      expect(arg.isSupporting).to.equal(expected);
    }
  });

  it("should return the number of children.", async function () {
    for (let arr of [[0, 2], [1, 2], [2, 1], [3, 1], [4, 0], [5, 0], [6, 0]]) {
      let id = arr[0], expected = arr[1];
      const arg = await arborVote.arguments(id);
      expect(arg.unfinalizedChildCount).to.equal(expected);
    }
  });

  it("should change the number of votes and vote tokens left.", async function () {

    const voteAndCheckHelper = async function checkVote(id, voteStrength) {
      const voteTokensBefore = await arborVote.getVoteTokens();
      let arg = await arborVote.arguments(id);
      const argumentVotesBefore = await arg.votes;

      if(voteStrength >= 0)
        await arborVote.voteFor(id, voteStrength);
      else
        await arborVote.voteAgainst(id, Math.abs(voteStrength));

      expect(await arborVote.getVoteTokens()).to.equal(Number(voteTokensBefore) - Math.pow(voteStrength, 2));

      arg = await arborVote.arguments(id);
      expect(arg.votes).to.equal(Number(argumentVotesBefore) + voteStrength);
    };

    await arborVote.advanceStage();
    expect(await arborVote.currentStage()).to.equal(2);

    // vote on arg 1 (id=1)
    await voteAndCheckHelper(1, 2).catch(function (err) { console.log(err); });

    // vote on arg 2 (id=2)
    await voteAndCheckHelper(2, 2).catch(function (err) { console.log(err); });

    // vote on arg 1.1 (id=3)
    await voteAndCheckHelper(3, 1).catch(function (err) { console.log(err); });

    // vote on arg 1.1.1 (id=6)
    await voteAndCheckHelper(6, -1).catch(function (err) { console.log(err); });
  });

  it("should revert if a voter tries to vote more than once on the same argument", async function () {
    await expect(arborVote.voteFor(2, 1)).to.be.revertedWith("Voting is only allowed once per argument.");
  });

  it("should finalize the arguments.", async function () {
    await arborVote.advanceStage();
    expect(await arborVote.currentStage()).to.equal(3);

    await arborVote.finalizeLeaves();

    for (let id of [6, 5, 4, 3, 2, 1]) {
      const arg = await arborVote.arguments(id);
      expect(arg.isFinalized).to.equal(true);
    }
  });

  it("should accumulate the child votes correctly.", async function () {
    // Arg 1.1.1 (id=6) is a bad argument and results in Arg 1.1 (id=3) having 0 accumulated child votes
    for (let arr of [[6, 0], [5, 0], [4, 0], [3, 0], [2, 0], [1, 1], [0, 1]]) {
      const id = arr[0], expected = arr[1];
      const arg = await arborVote.arguments(id);
      expect(arg.accumulatedChildVotes).to.equal(expected);
    }
  });

  it("should accumulate the votes correctly.", async function () {
    for (let arr of [[6, -1], [5, 0], [4, 0], [3, 1], [2, 2], [1, 3], [0, 1]]) {
      const id = arr[0], expected = arr[1];
      const arg = await arborVote.arguments(id);
      expect(Number(await arg.votes) + Number(await arg.accumulatedChildVotes)).to.equal(expected);
    }
  });
});