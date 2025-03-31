
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlayerStats } from "@/hooks/usePlayerStats";

interface StatsCardProps {
  stats: PlayerStats;
  isLoading?: boolean;
}

const StatsCard = ({ stats, isLoading = false }: StatsCardProps) => {
  if (isLoading) {
    return (
      <Card className="stats-card">
        <CardHeader>
          <CardTitle className="text-2xl text-center">My Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 opacity-60 animate-pulse">
          <p className="text-center">Loading stats...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="stats-card">
      <CardHeader>
        <CardTitle className="text-2xl text-center">My Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Games Played</span>
            <span className="text-xl font-bold">{stats.gamesPlayed}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Win Rate</span>
            <span className="text-xl font-bold">{stats.winRate}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Wins</span>
            <span className="text-xl font-bold text-jungle-green">{stats.wins}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Losses</span>
            <span className="text-xl font-bold text-destructive">{stats.losses}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Win/Loss Ratio</span>
            <span>{stats.wins} / {stats.losses}</span>
          </div>
          <Progress value={stats.winRate} className="h-2 bg-jungle-lightGreen" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">APT Won</span>
            <span className="text-xl font-bold">{stats.aptWon.toFixed(2)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">🦁♥️ Won</span>
            <span className="text-xl font-bold">{stats.emojiWon.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Referrals</span>
            <span className="text-xl font-bold">{stats.referrals}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
