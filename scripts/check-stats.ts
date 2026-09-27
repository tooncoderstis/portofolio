import "dotenv/config";

import { getGithubStats } from "../lib/adapters/github";
import { getMonkeytypeStats } from "../lib/adapters/monkeytype";
import { getWakatimeStats } from "../lib/adapters/wakatime";

async function main(): Promise<void> {
  const results: Record<string, unknown> = {};

  if (process.env.GITHUB_TOKEN && process.env.GITHUB_USERNAME) {
    const github = await getGithubStats({
      token: process.env.GITHUB_TOKEN,
      username: process.env.GITHUB_USERNAME,
    });

    results.github = {
      username: github.username,
      totalContributions: github.contributions.total,
      currentStreak: github.streak.current,
      longestStreak: github.streak.longest,
      calendarDays: github.calendar.length,
      topLanguages: github.topLanguages.slice(0, 3),
    };
  }

  if (process.env.WAKATIME_API_KEY) {
    const wakatime = await getWakatimeStats({
      apiKey: process.env.WAKATIME_API_KEY,
    });

    results.wakatime = {
      username: wakatime.username,
      totalSeconds: wakatime.totalSeconds,
      totalText: wakatime.totalText,
      dailyAverageText: wakatime.dailyAverageText,
      languages: wakatime.languages.slice(0, 3).map((entry) => entry.name),
      last7DaysSeconds: wakatime.last7Days.map((day) => day.seconds),
    };
  }

  if (process.env.MONKEYTYPE_USERNAME) {
    const monkeytype = await getMonkeytypeStats({
      username: process.env.MONKEYTYPE_USERNAME,
      apiKey: process.env.MONKEYTYPE_API_KEY,
    });

    results.monkeytype = {
      name: monkeytype.name,
      bestWpm: monkeytype.bestWpm,
      bestAccuracy: monkeytype.bestAccuracy,
      completedTests: monkeytype.completedTests,
      maxStreak: monkeytype.maxStreak,
      bestsByDuration: monkeytype.bestsByDuration,
    };
  }

  if (Object.keys(results).length === 0) {
    console.error(
      "Tidak ada kredensial di .env. Lihat docs/runbooks/credentials.md.",
    );
    process.exitCode = 1;
    return;
  }

  console.log(JSON.stringify(results, null, 2));
}

main().catch((error: unknown) => {
  console.error("Gagal mengambil statistik:", error);
  process.exitCode = 1;
});
