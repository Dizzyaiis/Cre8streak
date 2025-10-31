import { useRewards, useRedeemReward, useRedemptions } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gift, Sparkles, ShoppingBag, GraduationCap, Percent, Store } from "lucide-react";
import { format } from "date-fns";

const iconMap: Record<string, any> = {
  digital: Gift,
  consult: Sparkles,
  course: GraduationCap,
  discount: Percent,
};

export function RewardsPage() {
  const { data: rewards, isLoading } = useRewards();
  const { data: redemptions } = useRedemptions();
  const redeemReward = useRedeemReward();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleRedeem = async (rewardId: string, rewardTitle: string, cost: number) => {
    if (!user || user.xpTotal < cost) {
      toast({
        title: "Insufficient XP",
        description: `You need ${cost} XP to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    try {
      await redeemReward.mutateAsync(rewardId);
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed ${rewardTitle}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">Rewards</h1>
          <p className="text-gray-600 mt-1">Redeem your XP for exclusive rewards</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Your Balance</p>
          <p className="text-3xl font-bold text-green-600">{user?.xpTotal || 0} XP</p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-purple-500 to-green-500 text-white">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Marketplace Coming Soon!</h3>
              <p className="text-sm text-white/90">
                We're building an exclusive marketplace where you'll be able to unlock premium creator courses, 
                resources, and tools using your XP points or money. Stay tuned!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold text-purple-900 mb-4">Available Rewards</h2>
        {isLoading ? (
          <div className="text-center py-8">Loading rewards...</div>
        ) : rewards && rewards.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward: any) => {
              const Icon = iconMap[reward.fulfillmentType] || Gift;
              const canAfford = (user?.xpTotal || 0) >= reward.xpCost;

              return (
                <Card key={reward.id} className={!canAfford ? "opacity-60" : ""}>
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-purple-900">{reward.title}</h3>
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {reward.fulfillmentType}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{reward.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-600">{reward.xpCost}</span>
                        <span className="text-sm text-gray-500">XP</span>
                      </div>
                      <Button
                        onClick={() => handleRedeem(reward.id, reward.title, reward.xpCost)}
                        disabled={!canAfford || redeemReward.isPending}
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Redeem
                      </Button>
                    </div>

                    {!canAfford && (
                      <p className="text-xs text-red-500 mt-2">
                        Need {reward.xpCost - (user?.xpTotal || 0)} more XP
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Gift className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No rewards available at the moment</p>
            </CardContent>
          </Card>
        )}
      </div>

      {redemptions && redemptions.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-purple-900 mb-4">Your Redemptions</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {redemptions.map((redemption: any) => (
                  <div key={redemption.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <h4 className="font-semibold text-purple-900">{redemption.reward.title}</h4>
                      <p className="text-sm text-gray-500">
                        Redeemed on {format(new Date(redemption.createdAt), "MMMM dd, yyyy")}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-red-600">-{redemption.xpSpent} XP</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
