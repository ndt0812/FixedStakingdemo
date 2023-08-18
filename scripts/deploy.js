
async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const Contract = await ethers.getContractFactory("FixedStaking");
  const contract = await Contract.deploy("0x40195D7F7aCcD636B4e8000a64E31e295d954b41");

  console.log("contract address:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
