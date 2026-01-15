const hre = require("hardhat");

async function main() {
  console.log("Deploying ChainPay contract...");

  const ChainPay = await hre.ethers.getContractFactory("ChainPay");
  const chainPay = await ChainPay.deploy();

  await chainPay.waitForDeployment();

  const address = await chainPay.getAddress();
  console.log("ChainPay deployed to:", address);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    address: address,
    timestamp: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });