// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract VotingSystem {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        bool active;
        mapping(address => bool) hasVoted;
        mapping(address => bool) voteChoice; // true for yes, false for no
    }

    struct Vote {
        uint256 proposalId;
        address voter;
        bool choice;
        uint256 timestamp;
        string ipfsHash; // For storing additional verification data
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(address => bool) public authorizedVoters;
    mapping(uint256 => Vote[]) public proposalVotes;
    
    uint256 public proposalCount;
    address public admin;
    
    event ProposalCreated(
        uint256 indexed proposalId,
        string title,
        string description,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed proposalId,
        address indexed voter,
        bool choice,
        uint256 timestamp,
        string ipfsHash
    );
    
    event VoterAuthorized(address indexed voter);
    event VoterRevoked(address indexed voter);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyAuthorizedVoter() {
        require(authorizedVoters[msg.sender], "Voter not authorized");
        _;
    }
    
    modifier proposalExists(uint256 _proposalId) {
        require(_proposalId < proposalCount, "Proposal does not exist");
        _;
    }
    
    modifier proposalActive(uint256 _proposalId) {
        require(proposals[_proposalId].active, "Proposal is not active");
        require(
            block.timestamp >= proposals[_proposalId].startTime &&
            block.timestamp <= proposals[_proposalId].endTime,
            "Voting period has ended or not started"
        );
        _;
    }
    
    constructor() {
        admin = msg.sender;
        authorizedVoters[msg.sender] = true;
    }
    
    function createProposal(
        string memory _title,
        string memory _description,
        uint256 _durationInHours
    ) external onlyAdmin returns (uint256) {
        uint256 proposalId = proposalCount;
        Proposal storage newProposal = proposals[proposalId];
        
        newProposal.id = proposalId;
        newProposal.title = _title;
        newProposal.description = _description;
        newProposal.yesVotes = 0;
        newProposal.noVotes = 0;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + (_durationInHours * 1 hours);
        newProposal.active = true;
        
        proposalCount++;
        
        emit ProposalCreated(
            proposalId,
            _title,
            _description,
            newProposal.startTime,
            newProposal.endTime
        );
        
        return proposalId;
    }
    
    function vote(
        uint256 _proposalId,
        bool _choice,
        string memory _ipfsHash
    ) external 
        onlyAuthorizedVoter 
        proposalExists(_proposalId) 
        proposalActive(_proposalId) 
    {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.hasVoted[msg.sender], "Already voted on this proposal");
        
        proposal.hasVoted[msg.sender] = true;
        proposal.voteChoice[msg.sender] = _choice;
        
        if (_choice) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }
        
        // Store the vote for verification
        Vote memory newVote = Vote({
            proposalId: _proposalId,
            voter: msg.sender,
            choice: _choice,
            timestamp: block.timestamp,
            ipfsHash: _ipfsHash
        });
        
        proposalVotes[_proposalId].push(newVote);
        
        emit VoteCast(_proposalId, msg.sender, _choice, block.timestamp, _ipfsHash);
    }
    
    function authorizeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = true;
        emit VoterAuthorized(_voter);
    }
    
    function revokeVoter(address _voter) external onlyAdmin {
        authorizedVoters[_voter] = false;
        emit VoterRevoked(_voter);
    }
    
    function closeProposal(uint256 _proposalId) external onlyAdmin proposalExists(_proposalId) {
        proposals[_proposalId].active = false;
    }
    
    function getProposal(uint256 _proposalId) external view proposalExists(_proposalId) returns (
        uint256 id,
        string memory title,
        string memory description,
        uint256 yesVotes,
        uint256 noVotes,
        uint256 startTime,
        uint256 endTime,
        bool active
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.title,
            proposal.description,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.active
        );
    }
    
    function hasVoted(uint256 _proposalId, address _voter) external view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }
    
    function getVoteChoice(uint256 _proposalId, address _voter) external view returns (bool) {
        require(proposals[_proposalId].hasVoted[_voter], "Voter has not voted");
        return proposals[_proposalId].voteChoice[_voter];
    }
    
    function getProposalVotes(uint256 _proposalId) external view returns (Vote[] memory) {
        return proposalVotes[_proposalId];
    }
    
    function getAllProposals() external view returns (uint256[] memory) {
        uint256[] memory allProposals = new uint256[](proposalCount);
        for (uint256 i = 0; i < proposalCount; i++) {
            allProposals[i] = i;
        }
        return allProposals;
    }
    
    function getVotingPower(address _voter) external view returns (bool) {
        return authorizedVoters[_voter];
    }
}