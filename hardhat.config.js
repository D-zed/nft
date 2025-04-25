require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
require("solidity-coverage");
require("hardhat-gas-reporter"); // 引入插件
// 验证
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();
//可以直接导入工具箱：https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-toolbox

const fs = require("fs");
// const infuraId = fs.readFileSync(".infuraid").toString().trim() || "";

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia:{
      url:`https://sepolia.infura.io/v3/${process.env.INFURA_ID}`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      chainId:11155111
    }
    // mumbai: {
    //   url: `https://polygon-mumbai.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d`,
    //   //accounts: [process.env.privateKey]
    // },
    // matic: {
    //   url: "https://polygon-mainnet.g.alchemy.com/v2/nAhiCHKvZkhkp4A7PkkCIBON0-BXW26d",
    //   //accounts: [process.env.privateKey]
    // },
    // goerli: {
    //   url: process.env.REACT_APP_ALCHEMY_API_URL,
    //   accounts: [ process.env.REACT_APP_PRIVATE_KEY ]
    // }
  },
  solidity: {
    version: "0.8.26",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  gasReporter: {
    enabled: true,    // 启用 Gas 报告
  },
  etherscan:{
    apiKey: {
      sepolia:process.env.ETHERSCAN_API
    }
  },
};
