# BlockVote - Decentralized Voting Platform

A secure, transparent blockchain-based voting system built with React, TypeScript, Ethereum, and MetaMask integration.

## 🚀 Features

- **Real Blockchain Technology**: Built on Ethereum using Hardhat and Solidity smart contracts
- **MetaMask Integration**: Secure wallet connection and transaction signing
- **Transparent Voting**: All votes are permanently recorded on the blockchain
- **Authorized Voting**: Admin-controlled voter authorization system
- **Real-time Results**: Live vote counting and progress visualization
- **Secure Authentication**: MetaMask wallet-based user authentication
- **Transaction Verification**: Each vote generates a verifiable blockchain transaction

## 🛠 Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui
- **Blockchain**: Ethereum, Solidity, Hardhat
- **Web3**: Ethers.js, MetaMask
- **Smart Contracts**: VotingSystem.sol with comprehensive voting logic
- **Development**: Vite, ESLint, Node.js

## 📋 Prerequisites

- Node.js (v18 or higher)
- MetaMask browser extension
- Git

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd blockchain-voting-system
npm install
```

### 2. Start Local Blockchain

```bash
# Start Hardhat local blockchain network
npx hardhat node
```

This will start a local Ethereum network on `http://127.0.0.1:8545` with pre-funded accounts.

### 3. Deploy Smart Contract

In a new terminal:

```bash
# Compile and deploy the voting contract
npx hardhat compile
npx hardhat run scripts/deploy.cjs --network localhost
```

### 4. Configure MetaMask

1. Open MetaMask and add a new network:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`

2. Import a test account from Hardhat:
   - Copy a private key from the Hardhat node output
   - Import it into MetaMask

### 5. Start the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to access the voting platform.

## 🎯 How to Use

### For Voters

1. **Connect Wallet**: Click "Connect MetaMask" to connect your wallet
2. **Switch Network**: Ensure you're connected to the Hardhat Local network
3. **View Proposals**: Browse active voting proposals
4. **Cast Vote**: Click "Vote Yes" or "Vote No" on active proposals
5. **Confirm Transaction**: Approve the transaction in MetaMask
6. **View Results**: See real-time vote counts and percentages

### For Administrators

1. **Access Admin Panel**: Click the "Admin" tab in the navigation
2. **Create Proposals**: Add new voting proposals with title, description, and duration
3. **Authorize Voters**: Add Ethereum addresses to the authorized voters list
4. **Manage Voting**: Monitor and control the voting process

## 🔧 Smart Contract Features

The `VotingSystem.sol` contract includes:

- **Proposal Management**: Create and manage voting proposals
- **Voter Authorization**: Admin-controlled voter permissions
- **Secure Voting**: Prevent double voting and ensure vote integrity
- **Time-bound Voting**: Set voting periods for each proposal
- **Vote Verification**: Generate transaction hashes for vote verification
- **Event Logging**: Comprehensive event emission for transparency

## 🔐 Security Features

- **MetaMask Integration**: Secure wallet-based authentication
- **Smart Contract Security**: Solidity best practices and access controls
- **Transaction Verification**: Each vote is cryptographically secured
- **Authorized Voting**: Only approved addresses can vote
- **Immutable Records**: Votes permanently stored on blockchain
- **No Double Voting**: Smart contract prevents multiple votes per proposal

## 📁 Project Structure

```
├── contracts/
│   └── VotingSystem.sol          # Main voting smart contract
├── scripts/
│   └── deploy.cjs                # Contract deployment script
├── src/
│   ├── components/
│   │   ├── VotingDashboard.tsx   # Main voting interface
│   │   ├── AdminPanel.tsx        # Admin management interface
│   │   └── ui/                   # Reusable UI components
│   ├── contexts/
│   │   └── Web3Context.tsx       # Web3 and blockchain integration
│   ├── types/
│   │   └── ethereum.d.ts         # TypeScript declarations
│   └── App.tsx                   # Main application component
├── hardhat.config.cjs            # Hardhat configuration
└── package.json                  # Dependencies and scripts
```

## 🌐 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production

# Blockchain
npm run node            # Start Hardhat blockchain
npm run compile         # Compile smart contracts
npm run deploy:local    # Deploy to local network

# Code Quality
npm run lint            # Run ESLint
```

## 🔗 Smart Contract Details

### Contract Address
- **Local Network**: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### Key Functions
- `createProposal(title, description, duration)` - Create a new voting proposal
- `vote(proposalId, choice, ipfsHash)` - Cast a vote on a proposal
- `authorizeVoter(address)` - Authorize a new voter
- `getProposal(proposalId)` - Get proposal details
- `getAllProposals()` - Get all proposals

## 🚨 Important Notes

- This is a development setup using Hardhat's local network
- For production deployment, configure mainnet or testnet networks
- Ensure MetaMask is connected to the correct network
- Keep your private keys secure and never share them
- The deployer account is automatically set as the admin

## 🛠 Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check that you're connected to the Hardhat Local network
- Try refreshing the page and reconnecting

### Contract Interaction Errors
- Verify the Hardhat node is running
- Check that the contract is deployed
- Ensure you have sufficient ETH for gas fees

### Authorization Issues
- Only authorized addresses can vote
- Admin must authorize voters through the Admin Panel
- The deployer account is automatically authorized

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions, please open a GitHub issue or contact the development team.

---

**Built with ❤️ using React, Ethereum, and MetaMask**


