import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetMyGameSessions } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  Award,
  CheckCircle2,
  Clock,
  GamepadIcon,
  LogIn,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDate(timestampNs: bigint): string {
  const ms = Number(timestampNs / 1_000_000n);
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateShort(timestampNs: bigint): string {
  const ms = Number(timestampNs / 1_000_000n);
  return new Date(ms).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

const GAME_NAMES = ["Choose The Word", "Choose The Image"];
const GAME_COLORS = {
  "Choose The Word": {
    stroke: "hsl(var(--primary))",
    fill: "hsl(var(--primary))",
  },
  "Choose The Image": {
    stroke: "hsl(142 71% 45%)",
    fill: "hsl(142 71% 45%)",
  },
};

export default function ProfilePage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: sessions, isLoading } = useGetMyGameSessions();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div
          className="max-w-md mx-auto text-center"
          data-ocid="profile.section"
        >
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <GamepadIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground mb-8">
            Sign in to view your game history, scores, and progress over time.
          </p>
          <button
            type="button"
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="profile.signin.button"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            <LogIn className="h-5 w-5" />
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
          <p className="text-sm text-muted-foreground mt-6">
            Or{" "}
            <Link
              to="/"
              className="text-primary hover:underline"
              data-ocid="profile.home.link"
            >
              browse games
            </Link>{" "}
            as a guest.
          </p>
        </div>
      </div>
    );
  }

  const principalStr = identity.getPrincipal().toString();
  const shortPrincipal = `${principalStr.slice(0, 8)}...`;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg mb-8" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    );
  }

  const sortedSessions = [...(sessions ?? [])].sort((a, b) =>
    Number(b.timestamp - a.timestamp),
  );

  // Stats
  const totalSessions = sortedSessions.length;
  const totalCorrect = sortedSessions.reduce(
    (sum, s) => sum + Number(s.correct),
    0,
  );
  const avgDuration =
    totalSessions > 0
      ? Math.round(
          sortedSessions.reduce(
            (sum, s) => sum + Number(s.durationSeconds),
            0,
          ) / totalSessions,
        )
      : 0;
  const bestScore =
    totalSessions > 0
      ? Math.max(...sortedSessions.map((s) => Number(s.correct)))
      : 0;

  // Per-game chart data (oldest first)
  function buildChartData(gameName: string) {
    return [...sortedSessions]
      .filter((s) => s.gameName === gameName)
      .reverse()
      .map((s) => {
        const total = Number(s.correct) + Number(s.wrong);
        const accuracy =
          total > 0 ? Math.round((Number(s.correct) / total) * 100) : 0;
        return {
          date: formatDateShort(s.timestamp),
          accuracy,
        };
      });
  }

  if (totalSessions === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">
            ID: {shortPrincipal}
          </p>
        </div>
        <div
          className="bg-card rounded-lg border border-border p-16 text-center"
          data-ocid="profile.sessions.empty_state"
        >
          <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            No sessions yet
          </h2>
          <p className="text-muted-foreground mb-6">
            Play some games to start tracking your progress!
          </p>
          <Link
            to="/"
            data-ocid="profile.play.link"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            <GamepadIcon className="h-4 w-4" />
            Browse Games
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-5xl"
      data-ocid="profile.page"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ID: {shortPrincipal}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card data-ocid="profile.sessions.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <GamepadIcon className="h-4 w-4" />
              Total Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {totalSessions}
            </p>
          </CardContent>
        </Card>

        <Card data-ocid="profile.avgtime.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {formatDuration(avgDuration)}
            </p>
          </CardContent>
        </Card>

        <Card data-ocid="profile.bestscore.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Award className="h-4 w-4" />
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{bestScore}</p>
          </CardContent>
        </Card>

        <Card data-ocid="profile.totalcorrect.card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Total Correct
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalCorrect}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-game charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {GAME_NAMES.map((gameName, idx) => {
          const chartData = buildChartData(gameName);
          const colors = GAME_COLORS[gameName as keyof typeof GAME_COLORS];
          const gradientId = `gradient-${idx}`;
          return (
            <Card key={gameName} data-ocid={`profile.chart.panel.${idx + 1}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4" />
                  {gameName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id={gradientId}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor={colors.fill}
                            stopOpacity={0.25}
                          />
                          <stop
                            offset="95%"
                            stopColor={colors.fill}
                            stopOpacity={0.02}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        className="stroke-border"
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11 }}
                        className="text-muted-foreground"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => `${v}%`}
                        className="text-muted-foreground"
                      />
                      <Tooltip
                        formatter={(value) => [`${value}%`, "Accuracy"]}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="accuracy"
                        stroke={colors.stroke}
                        strokeWidth={2}
                        fill={`url(#${gradientId})`}
                        dot={{ fill: colors.stroke, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[220px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      Not enough data yet
                      <br />
                      <span className="text-xs">
                        Play at least 2 sessions to see your trend
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Session History Table */}
      <Card data-ocid="profile.sessions.table">
        <CardHeader>
          <CardTitle className="text-base">Session History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead>Game</TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Wrong</TableHead>
                <TableHead className="text-center">Duration</TableHead>
                <TableHead className="text-center">Accuracy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSessions.map((session, index) => {
                const total = Number(session.correct) + Number(session.wrong);
                const accuracy =
                  total > 0
                    ? Math.round((Number(session.correct) / total) * 100)
                    : 0;
                return (
                  <TableRow
                    key={`${session.timestamp}-${index}`}
                    data-ocid={`profile.sessions.row.${index + 1}`}
                  >
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(session.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {session.gameName}
                    </TableCell>
                    <TableCell className="text-center text-sm text-green-600 font-medium">
                      {Number(session.correct)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-red-500 font-medium">
                      {Number(session.wrong)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {formatDuration(Number(session.durationSeconds))}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`text-sm font-semibold ${
                          accuracy >= 80
                            ? "text-green-600"
                            : accuracy >= 50
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {accuracy}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
