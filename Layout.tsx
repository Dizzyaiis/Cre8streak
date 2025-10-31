import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "./ui/button";
import { Home, Trophy, Gift, User, LogOut } from "lucide-react";

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { path: "/rewards", label: "Rewards", icon: Gift },
    { path: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-green-50">
      <header className="bg-white border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Cre8streak" className="h-10" />
          </div>

          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <span
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                    location === item.path
                      ? "bg-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </span>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden sm:flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-900">{user.displayName}</p>
                  <p className="text-xs text-green-600 font-bold">{user.xpTotal} XP</p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <nav className="md:hidden flex justify-around border-t border-purple-100 py-2 bg-white">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg cursor-pointer ${
                  location === item.path ? "text-purple-600" : "text-gray-600"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </span>
            </Link>
          ))}
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
