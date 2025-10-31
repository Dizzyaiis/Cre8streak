import { useDashboard, useCheckIn } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Flame, Zap, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export function HomePage() {
  const { data, isLoading } = useDashboard();
  const checkIn = useCheckIn();
  const { toast } = useToast();

  const handleCheckIn = async () => {
    try {
      const result = await checkIn.mutateAsync();
      toast({
        title: "Check-in successful!",
        description: `+${result.xpAwarded} XP! Current streak: ${result.newStreak} days`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const xpToNextLevel = Math.ceil((data?.user.xpTotal || 0) / 100) * 100 + 100;
  const xpProgress = ((data?.user.xpTotal || 0) % 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Welcome back, {data?.user.displayName}!</h1>
          <p className="text-gray-600 mt-1">Keep your creative streak alive</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Current Streak</p>
                <p className="text-4xl font-bold mt-1">{data?.currentStreak || 0}</p>
                <p className="text-purple-100 text-sm mt-1">days</p>
              </div>
              <Flame className="w-16 h-16 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total XP</p>
                <p className="text-4xl font-bold mt-1">{data?.user.xpTotal || 0}</p>
                <p className="text-green-100 text-sm mt-1">points</p>
              </div>
              <Zap className="w-16 h-16 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Best Streak</p>
                <p className="text-4xl font-bold mt-1">{data?.user.bestStreak || 0}</p>
                <p className="text-orange-100 text-sm mt-1">days</p>
              </div>
              <TrendingUp className="w-16 h-16 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Check-in</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-gray-600 mb-2">
                Check in today to maintain your streak and earn XP!
              </p>
              {data?.lastCheckIn && (
                <p className="text-sm text-gray-500">
                  Last check-in: {format(new Date(data.lastCheckIn), "MMMM dd, yyyy")}
                </p>
              )}
            </div>
            <Button
              onClick={handleCheckIn}
              disabled={checkIn.isPending}
              className="bg-purple-600 hover:bg-purple-700"
              size="lg"
            >
              <Calendar className="w-5 h-5 mr-2" />
              {checkIn.isPending ? "Checking in..." : "Check In Today"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>XP Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level Progress</span>
              <span>{xpProgress}/100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-4" />
            <p className="text-xs text-gray-500 mt-2">
              {100 - xpProgress} XP needed to reach next milestone
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentCheckIns && data.recentCheckIns.length > 0 ? (
            <div className="space-y-2">
              {data.recentCheckIns.map((checkIn: any, index: number) => (
                <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{format(new Date(checkIn.checkInDate), "MMMM dd, yyyy")}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-600">+{checkIn.xpAwarded} XP</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No recent activity. Check in to get started!</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-100 to-green-100 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-purple-900 mb-1">Pro Tip</h3>
              <p className="text-sm text-gray-700">
                Check in every day to build your streak! Every 7-day milestone earns bonus XP. Stay consistent to climb the leaderboard!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
