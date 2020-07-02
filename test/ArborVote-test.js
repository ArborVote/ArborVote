const { expect } = require("chai");

let arborVote;

before(async function () {
  const ArborVote = await ethers.getContractFactory("ArborVote");
  arborVote = await ArborVote.deploy("Trees are great!"); // id 0
  await arborVote.deployed();

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
  it("Should return the root thesis after the constructor was executed.", async function() {
    expect(await arborVote.getText(0)).to.equal("Trees are great!");
  });

  it("Should assign the correct argument ids.", async function() {
    expect(await arborVote.getText(1)).to.equal("1");
    expect(await arborVote.getText(2)).to.equal("2");
    expect(await arborVote.getText(3)).to.equal("1.1");
    expect(await arborVote.getText(4)).to.equal("1.2");
    expect(await arborVote.getText(5)).to.equal("2.1");
    expect(await arborVote.getText(6)).to.equal("1.1.1");
  });

  it("Should correctly display arguments as pro and con arguments.", async function() {
    expect(await arborVote.getSupporting(1)).to.equal(true);
    expect(await arborVote.getSupporting(2)).to.equal(false);
    expect(await arborVote.getSupporting(3)).to.equal(true);
    expect(await arborVote.getSupporting(4)).to.equal(false);
    expect(await arborVote.getSupporting(5)).to.equal(true);
    expect(await arborVote.getSupporting(6)).to.equal(true);
  });

  it("Should return the correct number of children.", async function() {
    expect(await arborVote.getNumberOfChildren(0)).to.equal(2);
    expect(await arborVote.getNumberOfChildren(1)).to.equal(2);
    expect(await arborVote.getNumberOfChildren(2)).to.equal(1);
    expect(await arborVote.getNumberOfChildren(3)).to.equal(1);
    expect(await arborVote.getNumberOfChildren(4)).to.equal(0);
    expect(await arborVote.getNumberOfChildren(5)).to.equal(0);
    expect(await arborVote.getNumberOfChildren(5)).to.equal(0);
  });
});
