import { ASSETS } from "@/lib/assets";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Settings } from "lucide-react";

export default function AppLayout() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <img
                src={ASSETS.logo}
                alt="Rehab Game Hub"
                className="h-10 w-10"
              />
              <h1 className="text-xl font-semibold text-foreground">
                Rehab Game Hub
              </h1>
            </Link>
            <nav className="flex items-center gap-2">
              <Link
                to="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPath === "/"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                to="/manager"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPath === "/manager"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Settings className="h-4 w-4" />
                <span className="font-medium">Manager</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                typeof window !== "undefined"
                  ? window.location.hostname
                  : "rehab-game-hub",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
