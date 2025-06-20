
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Trophy, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [players, setPlayers] = useState<PlayerStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalStats, setTotalStats] = useState({
    totalPlayers: 0,
    totalGames: 0,
    totalWinnings: 0
  });

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
    } finally {
      setIsLoading(false);
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
            <CardTitle>Player Statistics</CardTitle>
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
              filteredPlayers.map((player) => (
                <div key={player.wallet_address} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium font-mono text-sm">
                        {formatWalletAddress(player.wallet_address)}
                      </p>
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
                    <Badge variant={player.win_rate > 50 ? "default" : "secondary"}>
                      {player.win_rate > 50 ? "High Performer" : "Regular"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPlayersCard;
