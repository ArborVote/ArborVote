const { usePlugin } = require('@nomiclabs/buidler/config');

usePlugin("@nomiclabs/buidler-waffle");
usePlugin("@nomiclabs/buidler-solhint");
usePlugin("solidity-coverage");
usePlugin("buidler-gas-reporter");

// This is a sample Buidler task.
// You can execute it with "npx buidler accounts".
// To learn how to create your own go to
// https://buidler.dev/guides/create-task.html
task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.getAddress());
  }
});

// You have to export an object to set up your config
// This object can have the following optional entries:
// defaultNetwork, networks, solc, and paths.
// Go to https://buidler.dev/config/ to learn more
module.exports = {
  solc: {
    version: '0.6.8',
    optimizer: {
      enabled: true,
      runs: 10000
    }
  },
  defaultNetwork: 'buidlerevm',
  networks: {
    localhost: {
      url: 'http://localhost:8545'
    },
    coverage: {
      url: 'http://localhost:8555'
    },
  },
  gasReporter: {
    currency: 'EUR'
  }
};
