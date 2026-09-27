import "dotenv/config";

import { getGithubStats } from "../lib/adapters/github";

async function main(): Promise<void> {
  const token = process.env.GITHUB_TOKEN;
  const username = process.env.GITHUB_USERNAME;

  if (!token || !username) {
    console.error(
      "GITHUB_TOKEN / GITHUB_USERNAME belum diisi di .env (lihat docs/runbooks/credentials.md).",
    );
    process.exitCode = 1;
    return;
  }

  const stats = await getGithubStats({ token, username });

  console.log(
    JSON.stringify(
      {
        username: stats.username,
        name: stats.profile.name,
        publicRepos: stats.profile.publicRepos,
        followers: stats.profile.followers,
        totalContributions: stats.contributions.total,
        currentStreak: stats.streak.current,
        longestStreak: stats.streak.longest,
        calendarDays: stats.calendar.length,
        topLanguages: stats.topLanguages.slice(0, 5),
        fetchedAt: stats.fetchedAt,
      },
      null,
      2,
    ),
  );
}

main().catch((error: unknown) => {
  console.error("Gagal mengambil statistik GitHub:", error);
  process.exitCode = 1;
});
