
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Settings, Copy, ExternalLink, AlertTriangle, Save } from "lucide-react";
import { ESCROW_WALLET_ADDRESS, MIN_APT_BALANCE, MIN_EMOJICOIN_BALANCE, NETWORK } from "@/utils/aptosConfig";

interface GameSettings {
  minAptBet: number;
  minEmojiBet: number;
  maxBetAmount: number;
  gameEnabled: boolean;
  maintenanceMode: boolean;
}

const AdminSettingsCard = () => {
  const { toast } = useToast();
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    minAptBet: 0.01,
    minEmojiBet: 0.01,
    maxBetAmount: 10,
    gameEnabled: true,
    maintenanceMode: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Use local storage to persist settings
      const savedSettings = localStorage.getItem('adminGameSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setGameSettings(parsed);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast({
        title: "Error",
        description: "Failed to load game settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Validate settings
      if (gameSettings.minAptBet <= 0 || gameSettings.minEmojiBet <= 0 || gameSettings.maxBetAmount <= 0) {
        toast({
          title: "Invalid Settings",
          description: "All bet amounts must be greater than 0",
          variant: "destructive",
        });
        return;
      }

      if (gameSettings.maxBetAmount < gameSettings.minAptBet || gameSettings.maxBetAmount < gameSettings.minEmojiBet) {
        toast({
          title: "Invalid Settings",
          description: "Maximum bet amount must be greater than minimum bet amounts",
          variant: "destructive",
        });
        return;
      }

      // Save to local storage
      localStorage.setItem('adminGameSettings', JSON.stringify(gameSettings));

      toast({
        title: "Settings Saved",
        description: "Game settings have been updated successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openFaucet = () => {
    window.open("https://aptoslabs.com/testnet-faucet", "_blank");
  };

  const openExplorer = () => {
    window.open(`https://explorer.aptoslabs.com/account/${ESCROW_WALLET_ADDRESS}?network=testnet`, "_blank");
  };

  const handleMaintenanceToggle = (enabled: boolean) => {
    setGameSettings(prev => ({ ...prev, maintenanceMode: enabled }));
    
    if (enabled) {
      toast({
        title: "Maintenance Mode Enabled",
        description: "The game is now in maintenance mode. Players cannot place bets.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Maintenance Mode Disabled",
        description: "The game is now live and players can place bets.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
                min="0.01"
                value={gameSettings.minAptBet}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  minAptBet: parseFloat(e.target.value) || 0.01
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="minEmojiBet">Minimum Emojicoin Bet</Label>
              <Input
                id="minEmojiBet"
                type="number"
                step="0.01"
                min="0.01"
                value={gameSettings.minEmojiBet}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  minEmojiBet: parseFloat(e.target.value) || 0.01
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maxBetAmount">Maximum Bet Amount</Label>
              <Input
                id="maxBetAmount"
                type="number"
                step="1"
                min="1"
                value={gameSettings.maxBetAmount}
                onChange={(e) => setGameSettings(prev => ({
                  ...prev,
                  maxBetAmount: parseFloat(e.target.value) || 1
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
                onCheckedChange={handleMaintenanceToggle}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSaveSettings} 
            className="w-full"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
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
                {gameSettings.maintenanceMode ? "Maintenance Mode Active" : "Testnet Environment"}
              </p>
            </div>
            <p className="text-xs text-amber-700">
              {gameSettings.maintenanceMode 
                ? "The game is currently in maintenance mode. Players cannot place bets."
                : "This is a testnet deployment. All tokens and transactions are for testing purposes only."
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsCard;
