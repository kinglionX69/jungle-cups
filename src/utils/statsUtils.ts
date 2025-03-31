
// Get player stats from the backend
export const getPlayerStats = async (address: string): Promise<any> => {
  try {
    // In a real implementation, this would make an API call to get the player's stats
    // For now, we'll return mock data
    return {
      gamesPlayed: 10,
      wins: 6,
      losses: 4,
      winRate: 60,
      aptWon: 2.5,
      emojiWon: 1200,
      referrals: 2,
    };
  } catch (error) {
    console.error("Error getting player stats:", error);
    return null;
  }
};

// Get leaderboard data from the backend
export const getLeaderboardData = async (): Promise<any> => {
  try {
    // In a real implementation, this would make an API call to get the leaderboard data
    // For now, we'll return mock data
    const mockAddresses = [
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
      "0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0",
      "0x456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123",
      "0x789abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456",
      "0xdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789abc",
    ];
    
    const aptLeaders = mockAddresses.map((address, i) => ({
      address,
      wins: 20 - i * 3,
      winRate: 80 - i * 5,
      earned: 10 - i,
    }));
    
    const emojiLeaders = mockAddresses.map((address, i) => ({
      address,
      wins: 18 - i * 2,
      winRate: 75 - i * 4,
      earned: 5000 - i * 800,
    }));
    
    return { aptLeaders, emojiLeaders };
  } catch (error) {
    console.error("Error getting leaderboard data:", error);
    return { aptLeaders: [], emojiLeaders: [] };
  }
};
