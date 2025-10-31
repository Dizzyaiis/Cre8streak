import { useState } from "react";
import { useLeaderboard } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Flame, Zap, Medal } from "lucide-react";

export function LeaderboardPage() {
  const [metric, setMetric] = useState<"streak" | "xp">("xp");
  const { data, isLoading } = useLeaderboard(metric);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Leaderboard</h1>
          <p className="text-gray-600 mt-1">See how you rank among creators</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setMetric("xp")}
          variant={metric === "xp" ? "default" : "outline"}
          className={metric === "xp" ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          <Zap className="w-4 h-4 mr-2" />
          Top XP
        </Button>
        <Button
          onClick={() => setMetric("streak")}
          variant={metric === "streak" ? "default" : "outline"}
          className={metric === "streak" ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          <Flame className="w-4 h-4 mr-2" />
          Longest Streaks
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Creators
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading...</div>
          ) : data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((user: any, index: number) => (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index < 3 ? "bg-gradient-to-r from-yellow-50 to-orange-50" : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                    {index === 0 && <Medal className="w-6 h-6 text-yellow-500" />}
                    {index === 1 && <Medal className="w-6 h-6 text-gray-400" />}
                    {index === 2 && <Medal className="w-6 h-6 text-orange-600" />}
                    {index > 2 && <span className="font-bold text-gray-600">#{user.rank}</span>}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-purple-900">{user.displayName}</h3>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {user.primaryPlatform}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">@{user.username}</p>
                  </div>

                  <div className="text-right">
                    {metric === "xp" ? (
                      <>
                        <p className="text-2xl font-bold text-green-600">{user.xpTotal}</p>
                        <p className="text-xs text-gray-500">XP</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-bold text-orange-600">{user.bestStreak}</p>
                        <p className="text-xs text-gray-500">day streak</p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No creators yet. Be the first!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
