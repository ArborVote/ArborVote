const Todos = artifacts.require("./Todos.sol");

module.exports = function(deployer) {
  deployer.deploy(Todos);
};
