# ArborVote dApp

frontend built using react, redux, web3 & webpack

## Install Dependencies

Install latest version of nodejs and yarn for the host os.

```
yarn install
```

## Run Locally

First the ArborVote contract must be deployed in a local ethereum blockchain.
Then make sure to edit the config file webpack.config.js to give the correct networkId and address for the ArborVote contract. 
The compiled Abi for the contract is at `./src/assets/contracts/ArborVote.json`, and may be changed to the abi of the latest contract that you deploy.
The following command will start the frontend and serve it on `http://localhost:3000`

```
yarn start
```

## Build App

```
yarn run build
```
