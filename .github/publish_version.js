import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions
const readPackageVersion = () => {
    const packageJsonPath = path.resolve(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const version = packageJson.version;
    console.log(`Package version is ${version}`);
    return version;
}

const checkGithubVersionAndExport = version => {
    // Compare with Github tag
    const githubRefName = (process.env.GITHUB_REF_NAME || '').replace('refs/tags/', '');
    if (githubRefName !== `v${version}`) {
        console.error(`🔴 Error: Tag ${githubRefName} does not match version v${version}`);
        process.exit(1);
    }
    // Export VERSION in GitHub Actions Environment
    const githubEnv = process.env.GITHUB_ENV;
    if (githubEnv) {
        fs.appendFileSync(githubEnv, `VERSION=${version}\n`);
    }
    return version;
}

const sanitizeValue = (value, fieldName) => {
    // Replace newlines with `\n`, single quotes with typographic quotes
    const sanitized = value
        .replace(/\n/g, '\\n')
        .replace(/'/g, '’');
    // Check for forbidden characters
    if (sanitized.includes("'") || sanitized.includes('"')) {
        throw new Error(`Value for ${fieldName} contains forbidden characters (' or ").`);
    }
    return sanitized;
}

const checkLength = (value, fieldName) => {
    const length = value.length;
    if (length > 1000) {
        throw new Error(`Value for ${fieldName} exceeds 1000 characters (current length: ${length}).`);
    }
};

const exportMatchingVersionData = envVersion => {
    // Load and parse versions.yml
    const versionsFilePath = './versions.yml';
    const versionsContent = fs.readFileSync(versionsFilePath, 'utf8');
    const versionsData = yaml.load(versionsContent);

    // Find version data
    const versionData = versionsData.versions.find(v => v.version === envVersion);
    if (!versionData) {
        console.error(`🔴 Error: No data found for version ${envVersion} in versions.yml`);
        process.exit(1);
    }

    // Extract and sanitize fields
    const label = sanitizeValue(versionData.label, 'label');
    const labelFr = sanitizeValue(versionData.label_fr, 'label_fr');
    const description = sanitizeValue(versionData.description, 'description');
    const descriptionFr = sanitizeValue(versionData.description_fr, 'description_fr');

    // Check lengths
    checkLength(description, 'description');
    checkLength(descriptionFr, 'description_fr');

    // Export environment variables
    const githubEnv = process.env.GITHUB_ENV;
    if (githubEnv) {
        fs.appendFileSync(githubEnv, `LABEL=${label}\n`);
        fs.appendFileSync(githubEnv, `LABEL_FR=${labelFr}\n`);
        fs.appendFileSync(githubEnv, `DESCRIPTION=${description}\n`);
        fs.appendFileSync(githubEnv, `DESCRIPTION_FR=${descriptionFr}\n`);
    }

    console.log('✅ Successfully extracted and set environment variables.');
};


const version = readPackageVersion();
const envVersion = checkGithubVersionAndExport(version);
exportMatchingVersionData(envVersion);