import "dotenv/config";

import { randomBytes } from "node:crypto";

import { hashPassword } from "../lib/hub/auth";

function main(): void {
  const password = process.argv[2];

  if (!password) {
    console.error("Pemakaian: npm run hub:hash -- <password>");
    process.exitCode = 1;
    return;
  }

  console.log("HUB_PASSWORD_HASH=" + hashPassword(password));
  console.log("HUB_SESSION_SECRET=" + randomBytes(32).toString("base64url"));
}

main();
