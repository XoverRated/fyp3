import React, { useState } from 'react';
import { Web3Provider } from './contexts/Web3Context';
import VotingDashboard from './components/VotingDashboard';
import AdminPanel from './components/AdminPanel';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Vote, Settings, Shield, Blocks } from 'lucide-react';
import { Toaster } from 'sonner';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState<'voting' | 'admin'>('voting');

  return (
    <Web3Provider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Blocks className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-xl font-bold">BlockVote</h1>
                    <p className="text-xs text-muted-foreground">Decentralized Voting Platform</p>
                  </div>
                </div>
                <Badge variant="outline" className="ml-4">
                  Powered by Ethereum
                </Badge>
              </div>

              <nav className="flex items-center gap-2">
                <Button
                  variant={activeView === 'voting' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('voting')}
                  className="flex items-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  Voting
                </Button>
                <Button
                  variant={activeView === 'admin' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('admin')}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {activeView === 'voting' ? <VotingDashboard /> : <AdminPanel />}
        </main>

        {/* Footer */}
        <footer className="border-t bg-muted/50 py-6">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Secure & Transparent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    All votes are cryptographically secured and permanently recorded on the Ethereum blockchain for complete transparency.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Vote className="w-4 h-4" />
                    MetaMask Integration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Connect your MetaMask wallet to securely authenticate and cast your votes on the blockchain.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Real Blockchain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">
                    Built on Ethereum using Hardhat for development and real smart contracts for production deployment.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground">
                BlockVote - Decentralized Voting Platform • Built with React, TypeScript, Ethereum & MetaMask
              </p>
            </div>
          </div>
        </footer>

        {/* Toast Notifications */}
        <Toaster richColors position="top-right" />
      </div>
    </Web3Provider>
  );
}

export default App;

