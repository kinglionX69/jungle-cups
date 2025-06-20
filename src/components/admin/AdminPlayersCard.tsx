
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Trophy, TrendingUp, Edit, Ban, RotateCcw, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { updatePlayerStats, resetPlayerStats, togglePlayerBan, isPlayerBanned } from "@/utils/adminActions";

interface PlayerStat {
  wallet_address: string;
  games_played: number;
  wins: number;
  losses: number;
  win_rate: number;
  apt_won: number;
  emoji_won: number;
  referrals: number;
  created_at: string;
}

const AdminPlayersCard = () => {
  const { toast } = useToast();
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalStats, setTotalStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    totalWinnings: 0
  });
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStat | null>(null);
  const [editingStats, setEditingStats] = useState<Partial<PlayerStat>>({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchPlayerStats();
  }, []);

  const fetchPlayerStats = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .order('games_played', { ascending: false });

      if (error) throw error;

      setPlayers(data || []);
      
      // Calculate totals
      const totals = (data || []).reduce((acc, player) => ({
        totalPlayers: acc.totalPlayers + 1,
        totalGames: acc.totalGames + player.games_played,
        totalWinnings: acc.totalWinnings + player.apt_won + (player.emoji_won * 0.001)
      }), { totalPlayers: 0, totalGames: 0, totalWinnings: 0 });
      
      setTotalStats(totals);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch player statistics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      setIsUpdating(true);
      const result = await updatePlayerStats(selectedPlayer.wallet_address, editingStats);
      
      if (result.success) {
        toast({
          title: "Player Updated",
          description: "Player statistics have been updated successfully",
        });
        fetchPlayerStats();
        setSelectedPlayer(null);
        setEditingStats({});
      } else {
        toast({
          title: "Update Failed",
          description: "Failed to update player statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating the player",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPlayer = async (walletAddress: string) => {
    try {
      const result = await resetPlayerStats(walletAddress);
      
      if (result.success) {
        toast({
          title: "Player Reset",
          description: "Player statistics have been reset to zero",
        });
        fetchPlayerStats();
      } else {
        toast({
          title: "Reset Failed",
          description: "Failed to reset player statistics",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error resetting player:", error);
      toast({
        title: "Error",
        description: "An error occurred while resetting the player",
        variant: "destructive",
      });
    }
  };

  const handleToggleBan = async (walletAddress: string) => {
    const isBanned = isPlayerBanned(walletAddress);
    
    try {
      const result = await togglePlayerBan(walletAddress, !isBanned);
      
      if (result.success) {
        toast({
          title: isBanned ? "Player Unbanned" : "Player Banned",
          description: `Player has been ${isBanned ? 'unbanned' : 'banned'} successfully`,
          variant: isBanned ? "default" : "destructive",
        });
        // Refresh the list to show updated ban status
        setPlayers(prev => [...prev]);
      } else {
        toast({
          title: "Action Failed",
          description: `Failed to ${isBanned ? 'unban' : 'ban'} player`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling ban:", error);
      toast({
        title: "Error",
        description: "An error occurred while updating ban status",
        variant: "destructive",
      });
    }
  };

  const filteredPlayers = players.filter(player =>
    player.wallet_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatWalletAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-jungle-darkGreen">
                  {totalStats.totalPlayers}
                </p>
                <p className="text-sm text-muted-foreground">Total Players</p>
              </div>
              <Users className="h-8 w-8 text-jungle-green" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-jungle-darkGreen">
                  {totalStats.totalGames}
                </p>
                <p className="text-sm text-muted-foreground">Total Games</p>
              </div>
              <Trophy className="h-8 w-8 text-jungle-orange" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-jungle-darkGreen">
                  {totalStats.totalWinnings.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">Total Winnings (APT)</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Player Management</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by wallet address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button onClick={fetchPlayerStats} variant="outline" size="sm">
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPlayers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm ? "No players found matching your search." : "No players found."}
              </p>
            ) : (
              filteredPlayers.map((player) => {
                const isBanned = isPlayerBanned(player.wallet_address);
                
                return (
                  <div key={player.wallet_address} className={`flex items-center justify-between p-4 border rounded-lg ${isBanned ? 'border-red-200 bg-red-50' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium font-mono text-sm">
                            {formatWalletAddress(player.wallet_address)}
                          </p>
                          {isBanned && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Banned
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(player.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{player.games_played}</p>
                        <p className="text-xs text-muted-foreground">Games</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{player.wins}</p>
                        <p className="text-xs text-muted-foreground">Wins</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.win_rate}%</p>
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.apt_won.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">APT Won</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.referrals}</p>
                        <p className="text-xs text-muted-foreground">Referrals</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPlayer(player);
                                setEditingStats({
                                  games_played: player.games_played,
                                  wins: player.wins,
                                  losses: player.losses,
                                  apt_won: player.apt_won,
                                  emoji_won: player.emoji_won,
                                  referrals: player.referrals
                                });
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Player Stats</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Games Played</Label>
                                  <Input
                                    type="number"
                                    value={editingStats.games_played || 0}
                                    onChange={(e) => setEditingStats(prev => ({
                                      ...prev,
                                      games_played: parseInt(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label>Wins</Label>
                                  <Input
                                    type="number"
                                    value={editingStats.wins || 0}
                                    onChange={(e) => setEditingStats(prev => ({
                                      ...prev,
                                      wins: parseInt(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>APT Won</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingStats.apt_won || 0}
                                    onChange={(e) => setEditingStats(prev => ({
                                      ...prev,
                                      apt_won: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <div>
                                  <Label>Emoji Won</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={editingStats.emoji_won || 0}
                                    onChange={(e) => setEditingStats(prev => ({
                                      ...prev,
                                      emoji_won: parseFloat(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                              </div>
                              <div>
                                <Label>Referrals</Label>
                                <Input
                                  type="number"
                                  value={editingStats.referrals || 0}
                                  onChange={(e) => setEditingStats(prev => ({
                                    ...prev,
                                    referrals: parseInt(e.target.value) || 0
                                  }))}
                                />
                              </div>
                              <Button 
                                onClick={handleUpdatePlayer}
                                disabled={isUpdating}
                                className="w-full"
                              >
                                {isUpdating ? "Updating..." : "Update Player"}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleResetPlayer(player.wallet_address)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleBan(player.wallet_address)}
                          className={isBanned ? "text-green-600 hover:text-green-700" : "text-red-600 hover:text-red-700"}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlayersCard;
