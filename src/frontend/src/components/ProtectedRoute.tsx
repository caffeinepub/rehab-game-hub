import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ASSETS } from "@/lib/assets";
import { Outlet } from "@tanstack/react-router";
import { Loader2, Shield } from "lucide-react";

export default function ProtectedRoute() {
  const { identity, isInitializing, login, isLoggingIn } =
    useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex justify-center mb-4">
              <img
                src={ASSETS.logo}
                alt="Rehab Game Hub"
                className="h-16 w-16"
              />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Manager Access</CardTitle>
            </div>
            <CardDescription className="text-base">
              This area is restricted. Please log in with Internet Identity to
              continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="lg"
              className="w-full"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="auth.login.button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login with Internet Identity"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <Outlet />;
}
