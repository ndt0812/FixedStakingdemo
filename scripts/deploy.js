
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await ethers.getContractFactory("FixedStaking");
  const contract = await Contract.deploy("0x73aC1b0dfb7d0227A4D02a1cC450c7bd9729eFDD");

  console.log("contract address:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
