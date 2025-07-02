import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

// Contract ABI - in a real app, this would be imported from artifacts
const VOTING_CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "title", "type": "string"},
      {"indexed": false, "internalType": "string", "name": "description", "type": "string"},
      {"indexed": false, "internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "endTime", "type": "uint256"}
    ],
    "name": "ProposalCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "proposalId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "voter", "type": "address"},
      {"indexed": false, "internalType": "bool", "name": "choice", "type": "bool"},
      {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string"}
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "voter", "type": "address"}
    ],
    "name": "VoterAuthorized",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "_voter", "type": "address"}],
    "name": "authorizeVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "authorizedVoters",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "_title", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"},
      {"internalType": "uint256", "name": "_durationInHours", "type": "uint256"}
    ],
    "name": "createProposal",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_proposalId", "type": "uint256"}],
    "name": "getProposal",
    "outputs": [
      {"internalType": "uint256", "name": "id", "type": "uint256"},
      {"internalType": "string", "name": "title", "type": "string"},
      {"internalType": "string", "name": "description", "type": "string"},
      {"internalType": "uint256", "name": "yesVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "noVotes", "type": "uint256"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "active", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllProposals",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"},
      {"internalType": "address", "name": "_voter", "type": "address"}
    ],
    "name": "hasVoted",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_proposalId", "type": "uint256"},
      {"internalType": "bool", "name": "_choice", "type": "bool"},
      {"internalType": "string", "name": "_ipfsHash", "type": "string"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Contract address deployed to local Hardhat network
const DEFAULT_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Web3ContextType {
  account: string | null;
  chainId: number | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  contract: ethers.Contract | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToLocalNetwork: () => Promise<void>;
}

interface Vote {
  proposalId: number;
  voter: string;
  choice: boolean;
  timestamp: number;
  ipfsHash: string;
}

interface Proposal {
  id: number;
  title: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  startTime: number;
  endTime: number;
  active: boolean;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const isConnected = !!account;
  const isCorrectNetwork = chainId === 31337; // Local Hardhat network

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Provider = new ethers.BrowserProvider(window.ethereum);
        const web3Signer = await web3Provider.getSigner();
        const userAccount = await web3Signer.getAddress();
        const network = await web3Provider.getNetwork();

        setProvider(web3Provider);
        setSigner(web3Signer);
        setAccount(userAccount);
        setChainId(Number(network.chainId));

        // Initialize contract
        const votingContract = new ethers.Contract(
          DEFAULT_CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          web3Signer
        );
        setContract(votingContract);

        console.log('Connected to MetaMask:', userAccount);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask is not installed');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setChainId(null);
    setProvider(null);
    setSigner(null);
    setContract(null);
  };

  const switchToLocalNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7A69' }], // 31337 in hex
        });
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: '0x7A69',
                  chainName: 'Hardhat Local',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding network:', addError);
          }
        }
      }
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
        }
      };

      const handleChainChanged = (chainId: string) => {
        setChainId(parseInt(chainId, 16));
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            await connectWallet();
          }
        } catch (error) {
          console.error('Error auto-connecting:', error);
        }
      }
    };

    autoConnect();
  }, []);

  const value: Web3ContextType = {
    account,
    chainId,
    provider,
    signer,
    contract,
    isConnected,
    isCorrectNetwork,
    connectWallet,
    disconnectWallet,
    switchToLocalNetwork,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};

// Utility functions for blockchain interactions
export const blockchainService = {
  // Cast a vote
  async castVote(contract: ethers.Contract, proposalId: number, choice: boolean): Promise<string> {
    try {
      // Generate a simple hash for IPFS (in a real app, you'd store actual data on IPFS)
      const voteData = {
        proposalId,
        choice,
        timestamp: Date.now(),
        voter: await contract.runner?.getAddress(),
      };
      const ipfsHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(voteData))).slice(0, 42);
      
      const tx = await contract.vote(proposalId, choice, ipfsHash);
      const receipt = await tx.wait();
      
      return receipt.hash;
    } catch (error) {
      console.error('Error casting vote:', error);
      throw error;
    }
  },

  // Create a new proposal
  async createProposal(
    contract: ethers.Contract,
    title: string,
    description: string,
    durationInHours: number
  ): Promise<number> {
    try {
      const tx = await contract.createProposal(title, description, durationInHours);
      const receipt = await tx.wait();
      
      // Extract proposal ID from events
      const event = receipt.logs.find((log: any) => {
        try {
          const parsedLog = contract.interface.parseLog(log);
          return parsedLog?.name === 'ProposalCreated';
        } catch {
          return false;
        }
      });
      
      if (event) {
        const parsedLog = contract.interface.parseLog(event);
        return Number(parsedLog?.args[0]);
      }
      
      throw new Error('Proposal creation event not found');
    } catch (error) {
      console.error('Error creating proposal:', error);
      throw error;
    }
  },

  // Get proposal details
  async getProposal(contract: ethers.Contract, proposalId: number): Promise<Proposal> {
    try {
      const result = await contract.getProposal(proposalId);
      return {
        id: Number(result[0]),
        title: result[1],
        description: result[2],
        yesVotes: Number(result[3]),
        noVotes: Number(result[4]),
        startTime: Number(result[5]),
        endTime: Number(result[6]),
        active: result[7],
      };
    } catch (error) {
      console.error('Error getting proposal:', error);
      throw error;
    }
  },

  // Get all proposals
  async getAllProposals(contract: ethers.Contract): Promise<Proposal[]> {
    try {
      const proposalIds = await contract.getAllProposals();
      const proposals: Proposal[] = [];
      
      for (const id of proposalIds) {
        const proposal = await blockchainService.getProposal(contract, Number(id));
        proposals.push(proposal);
      }
      
      return proposals;
    } catch (error) {
      console.error('Error getting all proposals:', error);
      throw error;
    }
  },

  // Check if user has voted
  async hasVoted(contract: ethers.Contract, proposalId: number, voterAddress: string): Promise<boolean> {
    try {
      return await contract.hasVoted(proposalId, voterAddress);
    } catch (error) {
      console.error('Error checking vote status:', error);
      throw error;
    }
  },

  // Check if user is authorized to vote
  async isAuthorizedVoter(contract: ethers.Contract, voterAddress: string): Promise<boolean> {
    try {
      return await contract.authorizedVoters(voterAddress);
    } catch (error) {
      console.error('Error checking authorization:', error);
      throw error;
    }
  },
};

export type { Proposal, Vote };