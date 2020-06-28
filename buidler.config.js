const { usePlugin } = require('@nomiclabs/buidler/config')

usePlugin("@nomiclabs/buidler-solhint");
usePlugin("solidity-coverage");
usePlugin("buidler-gas-reporter");

module.exports = {
  defaultNetwork: 'localhost',
  networks: {
    localhost: {
      url: 'http://localhost:8545'
    },
  },
  solc: {
    version: '0.5.1',
    optimizer: {
      enabled: true,
      runs: 10000
    }
  }
}
