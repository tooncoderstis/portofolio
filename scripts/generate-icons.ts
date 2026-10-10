import { mkdirSync } from "node:fs";
import { join } from "node:path";

import sharp from "sharp";

const root = process.cwd();
const publicIcons = join(root, "public", "icons");
const appDir = join(root, "app");

function iconSvg({ maskable }: { maskable: boolean }): string {
  const radius = maskable ? 0 : 112;
  const content = maskable
    ? `<g transform="translate(256 256) scale(0.68) translate(-256 -256)">
         <rect x="136" y="150" width="240" height="60" rx="30" fill="#ffffff" />
         <rect x="226" y="150" width="60" height="214" rx="30" fill="#ffffff" />
         <circle cx="256" cy="410" r="22" fill="#a5b4fc" />
       </g>`
    : `<rect x="136" y="150" width="240" height="60" rx="30" fill="#ffffff" />
       <rect x="226" y="150" width="60" height="214" rx="30" fill="#ffffff" />
       <circle cx="256" cy="410" r="22" fill="#a5b4fc" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#1d4ed8" />
        <stop offset="1" stop-color="#7c3aed" />
      </linearGradient>
    </defs>
    <rect width="512" height="512" rx="${radius}" fill="url(#bg)" />
    ${content}
  </svg>`;
}

const targets = [
  {
    svg: iconSvg({ maskable: false }),
    size: 192,
    file: join(publicIcons, "icon-192.png"),
  },
  {
    svg: iconSvg({ maskable: false }),
    size: 512,
    file: join(publicIcons, "icon-512.png"),
  },
  {
    svg: iconSvg({ maskable: true }),
    size: 512,
    file: join(publicIcons, "maskable-512.png"),
  },
  {
    svg: iconSvg({ maskable: false }),
    size: 180,
    file: join(appDir, "apple-icon.png"),
  },
];

async function main() {
  mkdirSync(publicIcons, { recursive: true });

  for (const target of targets) {
    await sharp(Buffer.from(target.svg))
      .resize(target.size, target.size)
      .png()
      .toFile(target.file);
  }

  console.log(`Ikon dibuat (${targets.length}):`);
  for (const target of targets) console.log(`- ${target.file}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
