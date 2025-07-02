import React, { useState, useEffect } from 'react';
import { useWeb3, blockchainService, Proposal } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { AlertCircle, CheckCircle, Clock, Users, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner';

const VotingDashboard: React.FC = () => {
  const {
    account,
    isConnected,
    isCorrectNetwork,
    contract,
    connectWallet,
    switchToLocalNetwork,
  } = useWeb3();

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [votingStates, setVotingStates] = useState<Record<number, boolean>>({});
  const [userVotes, setUserVotes] = useState<Record<number, boolean>>({});
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Load proposals and user data
  useEffect(() => {
    if (contract && account) {
      loadProposals();
      checkAuthorization();
    }
  }, [contract, account]);

  const loadProposals = async () => {
    if (!contract) return;

    try {
      setLoading(true);
      const allProposals = await blockchainService.getAllProposals(contract);
      setProposals(allProposals);

      // Check voting status for each proposal
      const voteStatus: Record<number, boolean> = {};
      for (const proposal of allProposals) {
        if (account) {
          const hasVoted = await blockchainService.hasVoted(
            contract,
            proposal.id,
            account
          );
          voteStatus[proposal.id] = hasVoted;
        }
      }
      setUserVotes(voteStatus);
    } catch (error) {
      console.error('Error loading proposals:', error);
      toast.error('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthorization = async () => {
    if (!contract || !account) return;

    try {
      const authorized = await blockchainService.isAuthorizedVoter(contract, account);
      setIsAuthorized(authorized);
    } catch (error) {
      console.error('Error checking authorization:', error);
    }
  };

  const handleVote = async (proposalId: number, choice: boolean) => {
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!isAuthorized) {
      toast.error('You are not authorized to vote');
      return;
    }

    try {
      setVotingStates(prev => ({ ...prev, [proposalId]: true }));
      
      toast.info('Please confirm the transaction in MetaMask...');
      const txHash = await blockchainService.castVote(contract, proposalId, choice);
      
      toast.success(`Vote cast successfully! Transaction: ${txHash.slice(0, 10)}...`);
      
      // Reload proposals to update vote counts
      await loadProposals();
    } catch (error: any) {
      console.error('Error voting:', error);
      if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('Already voted')) {
        toast.error('You have already voted on this proposal');
      } else {
        toast.error('Failed to cast vote: ' + error.message);
      }
    } finally {
      setVotingStates(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isProposalActive = (proposal: Proposal) => {
    const now = Date.now() / 1000;
    return proposal.active && now >= proposal.startTime && now <= proposal.endTime;
  };

  const getProposalStatus = (proposal: Proposal) => {
    const now = Date.now() / 1000;
    if (!proposal.active) return 'Closed';
    if (now < proposal.startTime) return 'Not Started';
    if (now > proposal.endTime) return 'Ended';
    return 'Active';
  };

  const getVotePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return (votes / totalVotes) * 100;
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Wallet className="w-12 h-12 mx-auto mb-4" />
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your MetaMask wallet to participate in blockchain voting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={connectWallet} className="w-full">
              Connect MetaMask
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please switch to the Hardhat Local Network to participate in voting.
            <Button
              onClick={switchToLocalNetwork}
              variant="outline"
              size="sm"
              className="ml-2"
            >
              Switch Network
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blockchain Voting System</h1>
        <p className="text-muted-foreground">
          Secure, transparent voting powered by blockchain technology
        </p>
        
        <div className="flex items-center gap-4 mt-4">
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            Connected: {account?.slice(0, 6)}...{account?.slice(-4)}
          </Badge>
          {isAuthorized ? (
            <Badge variant="default">
              <CheckCircle className="w-3 h-3 mr-1" />
              Authorized Voter
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Not Authorized
            </Badge>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading proposals...</p>
        </div>
      ) : proposals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No proposals available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {proposals.map((proposal) => {
            const totalVotes = proposal.yesVotes + proposal.noVotes;
            const yesPercentage = getVotePercentage(proposal.yesVotes, totalVotes);
            const noPercentage = getVotePercentage(proposal.noVotes, totalVotes);
            const status = getProposalStatus(proposal);
            const active = isProposalActive(proposal);
            const hasVoted = userVotes[proposal.id];
            const isVoting = votingStates[proposal.id];

            return (
              <Card key={proposal.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Proposal #{proposal.id}: {proposal.title}
                        <Badge
                          variant={
                            status === 'Active'
                              ? 'default'
                              : status === 'Ended'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          {status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{proposal.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p>{formatDate(proposal.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Time</p>
                        <p>{formatDate(proposal.endTime)}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Yes Votes</span>
                        <span className="text-sm text-muted-foreground">
                          {proposal.yesVotes} ({yesPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={yesPercentage} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">No Votes</span>
                        <span className="text-sm text-muted-foreground">
                          {proposal.noVotes} ({noPercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress value={noPercentage} className="h-2" />
                    </div>

                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Total Votes: {totalVotes}</span>
                      {hasVoted && (
                        <Badge variant="outline">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          You Voted
                        </Badge>
                      )}
                    </div>

                    {active && !hasVoted && isAuthorized && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleVote(proposal.id, true)}
                          disabled={isVoting}
                          variant="default"
                          className="flex-1"
                        >
                          {isVoting ? 'Voting...' : 'Vote Yes'}
                        </Button>
                        <Button
                          onClick={() => handleVote(proposal.id, false)}
                          disabled={isVoting}
                          variant="outline"
                          className="flex-1"
                        >
                          {isVoting ? 'Voting...' : 'Vote No'}
                        </Button>
                      </div>
                    )}

                    {!isAuthorized && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You need to be authorized by an admin to vote on proposals.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VotingDashboard;