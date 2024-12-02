import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packageJsonPath = path.resolve(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

console.log(`Package version is ${version}`);

// Comparer avec le tag GitHub
const githubRefName = (process.env.GITHUB_REF_NAME || '').replace('refs/tags/', '');
if (githubRefName !== `v${version}`) {
    console.error(`🔴 Error: Tag ${githubRefName} does not match version v${version}`);
    process.exit(1);
}

// Exporter VERSION dans l'environnement GitHub Actions
const githubEnv = process.env.GITHUB_ENV;
if (githubEnv) {
    fs.appendFileSync(githubEnv, `VERSION=${version}\n`);
}
