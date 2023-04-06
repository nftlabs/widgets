import path from 'path';
import fs from 'fs';
import esbuild from 'esbuild';

const EMBEDS_SRC_PATH = path.resolve(process.cwd(), "src/embeds");
const DIST_PATH = path.resolve(process.cwd(), "dist/");

const files = fs.readdirSync(EMBEDS_SRC_PATH);

fs.rmSync(DIST_PATH, { recursive: true, force: true });

esbuild
  .build({
    jsx: 'automatic',
    entryPoints: files.map((f) => path.resolve(EMBEDS_SRC_PATH, f)),
    bundle: true,
    minify: true,
    platform: "browser",
    target: "es2020",
    outdir: "./esout",


    splitting: false,
    write: false,
    sourcemap: false,
    define: {
      global: 'globalThis',
      process: JSON.stringify({
        env: "production"
      })
    },
  })
  .then((result) => {
    for (const file of result.outputFiles) {
      const fileContents = new TextDecoder().decode(file.contents);
      const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta http-equiv="X-UA-Compatible" content="IE=edge" /><meta name="viewport" content="width=device-width, initial-scale=1" /><link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect"  href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link  href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap"rel="stylesheet"></link><link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;402;500;600;700;800;900&display=swap" rel="stylesheet"></link></head><body><div id="root"></div><script type="module">${fileContents}</script></body></html>`;
 if (!fs.existsSync("./dist")) {
    fs.mkdirSync("./dist");
      }
      const pathSplit = file.path.split("/");
      fs.writeFileSync(
        path.resolve(
          DIST_PATH,
          pathSplit[pathSplit.length - 1].replace(".js", ".html")
        ),
        html
      );
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
