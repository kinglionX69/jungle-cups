
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Coins, Users } from "lucide-react";

interface LeaderboardPlayer {
  address: string;
  wins: number;
  winRate: number;
  earned: number;
}

interface LeaderboardCardProps {
  aptLeaders: LeaderboardPlayer[];
  emojiLeaders: LeaderboardPlayer[];
}

const LeaderboardCard = ({ aptLeaders, emojiLeaders }: LeaderboardCardProps) => {
  const [currentTab, setCurrentTab] = useState("most-wins");
  const [tokenType, setTokenType] = useState("APT");
  
  const getLeaderboardData = (tab: string) => {
    const leaders = tokenType === "APT" ? aptLeaders : emojiLeaders;
    
    switch (tab) {
      case "most-wins":
        return [...leaders].sort((a, b) => b.wins - a.wins);
      case "win-rate":
        return [...leaders].sort((a, b) => b.winRate - a.winRate);
      case "most-earned":
        return [...leaders].sort((a, b) => b.earned - a.earned);
      default:
        return leaders;
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="stats-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-center">Leaderboard</CardTitle>
        
        <div className="flex justify-center space-x-2 mt-2">
          <button
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              tokenType === "APT" 
                ? "bg-jungle-green text-white" 
                : "bg-white/60 text-jungle-darkGreen"
            }`}
            onClick={() => setTokenType("APT")}
          >
            APT
          </button>
          <button
            className={`px-3 py-1 rounded-full text-sm font-bold ${
              tokenType === "EMOJICOIN" 
                ? "bg-jungle-yellow text-jungle-darkGreen" 
                : "bg-white/60 text-jungle-darkGreen"
            }`}
            onClick={() => setTokenType("EMOJICOIN")}
          >
            🦁♥️ Emojicoin
          </button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="most-wins" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Most Wins</span>
            </TabsTrigger>
            <TabsTrigger value="win-rate" className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span className="hidden sm:inline">Win Rate</span>
            </TabsTrigger>
            <TabsTrigger value="most-earned" className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Most Earned</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="most-wins">
            <LeaderboardList 
              players={getLeaderboardData("most-wins")} 
              dataKey="wins"
              tokenType={tokenType}
            />
          </TabsContent>
          
          <TabsContent value="win-rate">
            <LeaderboardList 
              players={getLeaderboardData("win-rate")} 
              dataKey="winRate"
              tokenType={tokenType}
              formatValue={(val) => `${val}%`}
            />
          </TabsContent>
          
          <TabsContent value="most-earned">
            <LeaderboardList 
              players={getLeaderboardData("most-earned")} 
              dataKey="earned"
              tokenType={tokenType}
              formatValue={(val) => val.toString()}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface LeaderboardListProps {
  players: LeaderboardPlayer[];
  dataKey: keyof LeaderboardPlayer;
  tokenType: string;
  formatValue?: (val: number) => string;
}

const LeaderboardList = ({ 
  players, 
  dataKey, 
  tokenType,
  formatValue = (val) => val.toString() 
}: LeaderboardListProps) => {
  return (
    <div className="space-y-2">
      {players.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No players yet
        </div>
      ) : (
        players.slice(0, 10).map((player, index) => (
          <div 
            key={player.address} 
            className={`flex items-center justify-between p-2 rounded-lg
              ${index === 0 ? "bg-yellow-100" : 
                index === 1 ? "bg-gray-100" : 
                index === 2 ? "bg-orange-100" : "bg-white/50"}`}
          >
            <div className="flex items-center gap-2">
              <div className="w-6 text-center font-bold">#{index + 1}</div>
              <div className="truncate max-w-[120px] sm:max-w-[200px]">
                {player.address.slice(0, 6)}...{player.address.slice(-4)}
              </div>
            </div>
            <div className="font-bold">
              {formatValue(player[dataKey] as number)}
              {dataKey === "earned" && ` ${tokenType === "EMOJICOIN" ? "🦁♥️" : tokenType}`}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default LeaderboardCard;
