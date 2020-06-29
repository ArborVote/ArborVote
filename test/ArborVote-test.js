const { expect } = require("chai");

describe("ArborVote", function() {
  it("Should return the root thesis after the constructor was executed.", async function() {
    const ArborVote = await ethers.getContractFactory("ArborVote");
    const arborVote = await ArborVote.deploy("Trees are great!");

    await arborVote.deployed();
    expect(await arborVote.getText(0)).to.equal("Trees are great!");
  });
});
