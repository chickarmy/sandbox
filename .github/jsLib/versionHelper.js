import fs from 'fs';
import path from 'path';
import yaml from "js-yaml";
import {fileURLToPath} from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_PACKAGE_JSON = path.resolve(__dirname, '../../package.json')

// Helper functions
export const readPackageVersion = () => {
    const packageJson = JSON.parse(fs.readFileSync(ROOT_PACKAGE_JSON, 'utf-8'));
    const version = packageJson.version;
    console.log(`ℹ️ Package version is ${version}`);
    return version;
}

export const checkGithubVersionAndExport = version => {
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
    process.env.VERSION=version;
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

export const exportMatchingVersionData = envVersion => {
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
    process.env.LABEL=label;
    process.env.LABEL_FR=labelFr;
    process.env.DESCRIPTION=description;
    process.env.DESCRIPTION_FR=descriptionFr;
    console.log(`✅ version ${envVersion} data extracted and exported as environment variables.`);
}
