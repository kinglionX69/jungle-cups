
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Copy, ExternalLink, AlertTriangle } from "lucide-react";
import { ESCROW_WALLET_ADDRESS, MIN_APT_BALANCE, MIN_EMOJICOIN_BALANCE, NETWORK } from "@/utils/aptosConfig";

const AdminSettingsCard = () => {
  const { toast } = useToast();
  const [gameSettings, setGameSettings] = useState({
    minAptBet: 0.01,
    minEmojiBet: 0.01,
    maxBetAmount: 10,
    gameEnabled: true,
    maintenanceMode: false
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSaveSettings = () => {
    // In a real implementation, this would save to backend
    toast({
      title: "Settings Saved",
      description: "Game settings have been updated successfully",
    });
  };

  const openFaucet = () => {
    window.open("https://aptoslabs.com/testnet-faucet", "_blank");
  };

  const openExplorer = () => {
    window.open(`https://explorer.aptoslabs.com/account/${ESCROW_WALLET_ADDRESS}?network=testnet`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Network</Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{NETWORK.toUpperCase()}</Badge>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={openExplorer}
                  className="p-1"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Escrow Wallet Address</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={ESCROW_WALLET_ADDRESS} 
                  readOnly 
                  className="font-mono text-xs bg-muted"
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => copyToClipboard(ESCROW_WALLET_ADDRESS, "Escrow address")}
                  className="p-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={openExplorer}
                  className="p-2"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Minimum APT Balance</Label>
              <Input 
                value={`${MIN_APT_BALANCE} APT`} 
                readOnly 
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Minimum Emojicoin Balance</Label>
              <Input 
                value={`${MIN_EMOJICOIN_BALANCE} EMJ`} 
                readOnly 
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minAptBet">Minimum APT Bet</Label>
              <Input
                id="minAptBet"
                type="number"
                step="0.01"
                value={gameSettings.minAptBet}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  minAptBet: parseFloat(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minEmojiBet">Minimum Emojicoin Bet</Label>
              <Input
                id="minEmojiBet"
                type="number"
                step="0.01"
                value={gameSettings.minEmojiBet}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  minEmojiBet: parseFloat(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxBetAmount">Maximum Bet Amount</Label>
              <Input
                id="maxBetAmount"
                type="number"
                step="1"
                value={gameSettings.maxBetAmount}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  maxBetAmount: parseFloat(e.target.value)
                }))}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Game Enabled</Label>
                <p className="text-sm text-muted-foreground">
                  Allow players to place bets and play games
                </p>
              </div>
              <Switch
                checked={gameSettings.gameEnabled}
                onCheckedChange={(checked) => setGameSettings(prev => ({
                  ...prev,
                  gameEnabled: checked
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Temporarily disable the game for maintenance
                </p>
              </div>
              <Switch
                checked={gameSettings.maintenanceMode}
                onCheckedChange={(checked) => setGameSettings(prev => ({
                  ...prev,
                  maintenanceMode: checked
                }))}
              />
            </div>
          </div>
          
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              onClick={openFaucet}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Get Testnet Tokens
            </Button>
            
            <Button 
              onClick={openExplorer}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </Button>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <p className="text-sm font-medium text-amber-800">
                Testnet Environment
              </p>
            </div>
            <p className="text-xs text-amber-700">
              This is a testnet deployment. All tokens and transactions are for testing purposes only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsCard;
