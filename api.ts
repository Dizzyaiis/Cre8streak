import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/check-ins", { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["check-ins"] });
    },
  });
}

export function useDashboard() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return res.json();
    },
  });
}

export function useLeaderboard(metric: "streak" | "xp" = "xp") {
  return useQuery({
    queryKey: ["leaderboard", metric],
    queryFn: async () => {
      const res = await fetch(`/api/leaderboard?metric=${metric}`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const res = await fetch("/api/rewards");
      if (!res.ok) throw new Error("Failed to fetch rewards");
      return res.json();
    },
  });
}

export function useRedeemReward() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const res = await fetch(`/api/rewards/${rewardId}/redeem`, { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["redemptions"] });
    },
  });
}

export function useRedemptions() {
  return useQuery({
    queryKey: ["redemptions"],
    queryFn: async () => {
      const res = await fetch("/api/redemptions");
      if (!res.ok) throw new Error("Failed to fetch redemptions");
      return res.json();
    },
  });
}
