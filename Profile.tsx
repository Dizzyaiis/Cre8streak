import { useDashboard } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Flame, Zap, Calendar, Award } from "lucide-react";

const platformIcons: Record<string, string> = {
  youtube: "📺",
  tiktok: "🎵",
  facebook: "👥",
  instagram: "📸",
  threads: "🧵",
};

export function ProfilePage() {
  const { user } = useAuth();
  const { data, isLoading } = useDashboard();

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Profile</h1>
          <p className="text-gray-600 mt-1">View your stats and achievements</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl">
              {platformIcons[user?.primaryPlatform || "youtube"]}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user?.displayName}</h2>
              <p className="text-purple-100">@{user?.username}</p>
              {user?.email && <p className="text-purple-100 text-sm">{user.email}</p>}
              <div className="mt-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {user?.primaryPlatform || "youtube"} Creator
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-600" />
              Total XP Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-600">{user?.xpTotal || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Experience points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-600" />
              Best Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-orange-600">{user?.bestStreak || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Consecutive days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-purple-600" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-purple-600">{data?.currentStreak || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Days in a row</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Total Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-blue-600">{data?.recentCheckIns?.length || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Recent activity</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-4 rounded-lg ${(data?.currentStreak || 0) >= 7 ? 'bg-purple-100' : 'bg-gray-100 opacity-50'}`}>
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-sm font-semibold">Week Warrior</p>
              <p className="text-xs text-gray-500">7-day streak</p>
            </div>

            <div className={`text-center p-4 rounded-lg ${(user?.xpTotal || 0) >= 100 ? 'bg-green-100' : 'bg-gray-100 opacity-50'}`}>
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-sm font-semibold">Rising Star</p>
              <p className="text-xs text-gray-500">100 XP earned</p>
            </div>

            <div className={`text-center p-4 rounded-lg ${(user?.xpTotal || 0) >= 500 ? 'bg-yellow-100' : 'bg-gray-100 opacity-50'}`}>
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-sm font-semibold">Champion</p>
              <p className="text-xs text-gray-500">500 XP earned</p>
            </div>

            <div className={`text-center p-4 rounded-lg ${(data?.currentStreak || 0) >= 30 ? 'bg-orange-100' : 'bg-gray-100 opacity-50'}`}>
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-semibold">Consistency King</p>
              <p className="text-xs text-gray-500">30-day streak</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-green-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold text-purple-900 mb-2">Keep Creating!</h3>
            <p className="text-sm text-gray-700">
              Consistency is the key to success. Keep checking in daily to build your streak and earn more XP!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
