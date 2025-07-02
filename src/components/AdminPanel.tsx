import React, { useState } from 'react';
import { useWeb3, blockchainService } from '../contexts/Web3Context';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Plus, UserPlus, Shield } from 'lucide-react';
import { toast } from 'sonner';

const AdminPanel: React.FC = () => {
  const { contract, account, isConnected } = useWeb3();
  
  const [proposalForm, setProposalForm] = useState({
    title: '',
    description: '',
    duration: 24,
  });
  
  const [voterAddress, setVoterAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!proposalForm.title.trim() || !proposalForm.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      toast.info('Please confirm the transaction in MetaMask...');
      
      const proposalId = await blockchainService.createProposal(
        contract,
        proposalForm.title,
        proposalForm.description,
        proposalForm.duration
      );
      
      toast.success(`Proposal #${proposalId} created successfully!`);
      
      // Reset form
      setProposalForm({
        title: '',
        description: '',
        duration: 24,
      });
    } catch (error: any) {
      console.error('Error creating proposal:', error);
      if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('Only admin')) {
        toast.error('Only admin can create proposals');
      } else {
        toast.error('Failed to create proposal: ' + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleAuthorizeVoter = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract || !account) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!voterAddress.trim()) {
      toast.error('Please enter a voter address');
      return;
    }

    // Basic address validation
    if (!/^0x[a-fA-F0-9]{40}$/.test(voterAddress)) {
      toast.error('Invalid Ethereum address');
      return;
    }

    try {
      setAuthorizing(true);
      toast.info('Please confirm the transaction in MetaMask...');
      
      const tx = await contract.authorizeVoter(voterAddress);
      await tx.wait();
      
      toast.success(`Voter ${voterAddress.slice(0, 10)}... authorized successfully!`);
      setVoterAddress('');
    } catch (error: any) {
      console.error('Error authorizing voter:', error);
      if (error.message.includes('user rejected')) {
        toast.error('Transaction was rejected');
      } else if (error.message.includes('Only admin')) {
        toast.error('Only admin can authorize voters');
      } else {
        toast.error('Failed to authorize voter: ' + error.message);
      }
    } finally {
      setAuthorizing(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4" />
            <CardTitle>Admin Panel</CardTitle>
            <CardDescription>
              Connect your wallet to access admin functions
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage proposals and authorized voters
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Create Proposal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create Proposal
            </CardTitle>
            <CardDescription>
              Create a new voting proposal for the community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProposal} className="space-y-4">
              <div>
                <Label htmlFor="title">Proposal Title</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter proposal title"
                  value={proposalForm.title}
                  onChange={(e) =>
                    setProposalForm(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the proposal in detail"
                  value={proposalForm.description}
                  onChange={(e) =>
                    setProposalForm(prev => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="168"
                  placeholder="24"
                  value={proposalForm.duration}
                  onChange={(e) =>
                    setProposalForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 24 }))
                  }
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={creating}
                className="w-full"
              >
                {creating ? 'Creating...' : 'Create Proposal'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Authorize Voter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Authorize Voter
            </CardTitle>
            <CardDescription>
              Grant voting rights to an Ethereum address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthorizeVoter} className="space-y-4">
              <div>
                <Label htmlFor="voterAddress">Voter Address</Label>
                <Input
                  id="voterAddress"
                  type="text"
                  placeholder="0x..."
                  value={voterAddress}
                  onChange={(e) => setVoterAddress(e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the Ethereum address of the voter to authorize
                </p>
              </div>
              
              <Button 
                type="submit" 
                disabled={authorizing}
                className="w-full"
              >
                {authorizing ? 'Authorizing...' : 'Authorize Voter'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Admin Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>• <strong>Create Proposal:</strong> Only the contract admin can create new voting proposals.</p>
            <p>• <strong>Authorize Voters:</strong> Add Ethereum addresses to the list of authorized voters.</p>
            <p>• <strong>Duration:</strong> Set the voting period in hours (1-168 hours).</p>
            <p>• <strong>Security:</strong> All transactions are secured by MetaMask and recorded on the blockchain.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;