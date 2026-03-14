import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ASSETS } from "@/lib/assets";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, LogIn, LogOut, Settings, User } from "lucide-react";

export default function AppLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              data-ocid="nav.home.link"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img src={ASSETS.logo} alt="BrainBloom" className="h-10 w-10" />
              <h1 className="text-xl font-semibold text-foreground">
                BrainBloom
              </h1>
            </Link>
            <nav className="flex items-center gap-2">
              {identity ? (
                <>
                  <Link
                    to="/profile"
                    data-ocid="nav.profile.link"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      currentPath === "/profile"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">
                      My Profile
                    </span>
                  </Link>
                  <Link
                    to="/manager"
                    data-ocid="nav.manager.link"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                      currentPath.startsWith("/manager")
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">
                      Manager
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clear()}
                    data-ocid="nav.logout.button"
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline font-medium">
                      Sign Out
                    </span>
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => login()}
                    disabled={isLoggingIn}
                    data-ocid="nav.signin.button"
                    className="flex items-center gap-2"
                  >
                    <LogIn className="h-4 w-4" />
                    <span className="font-medium">Sign In</span>
                  </Button>
                  <Link
                    to="/manager"
                    data-ocid="nav.admin.link"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm"
                    title="Admin"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="font-medium hidden sm:inline">Admin</span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
