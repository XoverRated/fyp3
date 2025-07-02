const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying VotingSystem contract...");

  // Get the ContractFactory and Signers here.
  const VotingSystem = await ethers.getContractFactory("VotingSystem");
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy the contract
  const votingSystem = await VotingSystem.deploy();
  await votingSystem.waitForDeployment();

  console.log("VotingSystem deployed to:", await votingSystem.getAddress());

  // Save the contract address and ABI
  const contractAddress = await votingSystem.getAddress();
  const contractABI = VotingSystem.interface.format('json');

  console.log("Contract deployed successfully!");
  console.log("Contract Address:", contractAddress);
  
  // Create a sample proposal for testing
  console.log("Creating a sample proposal...");
  const tx = await votingSystem.createProposal(
    "Sample Voting Proposal",
    "This is a test proposal to demonstrate the voting system functionality",
    24 // 24 hours duration
  );
  await tx.wait();
  console.log("Sample proposal created!");

  return {
    address: contractAddress,
    abi: JSON.parse(contractABI)
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });