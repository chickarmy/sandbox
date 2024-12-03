import fetch from 'node-fetch';
import fs from 'fs';

async function createRelease() {
    const {
        GITHUB_ENV,
        GITHUB_REF_NAME,
        GITHUB_TOKEN,
        REPO_API_URL,
        LABEL,
        LABEL_FR,
        DESCRIPTION,
        DESCRIPTION_FR,
    } = process.env;

    if (!GITHUB_TOKEN || !REPO_API_URL || !GITHUB_REF_NAME || !LABEL || !DESCRIPTION || !GITHUB_ENV) {
        throw new Error('Missing required environment variables.');
    }

    const requestBody = {
        tag_name: GITHUB_REF_NAME,
        target_commitish: 'main',
        name: LABEL,
        body: `${DESCRIPTION}\n\n# ${LABEL_FR}\n\n${DESCRIPTION_FR}`,
        draft: true,
        prerelease: false,
    };

    try {
        // Create release
        const response = await fetch(`${REPO_API_URL}/releases`, {
            method: 'POST',
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js/Fetch',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to create release: ${errorText}`);
        }

        const responseData = await response.json();

        // Write API response to file
        const responseFile = 'release_response.json';
        fs.writeFileSync(responseFile, JSON.stringify(responseData, null, 2));
        console.log(`Release creation response saved to: ${responseFile}`);

        const releaseId = responseData.id;
        const uploadUrl = responseData.upload_url;

        if (!releaseId) {
            throw new Error(`Release ID is null. Full response: ${JSON.stringify(responseData)}`);
        }

        console.log(`Release created successfully! id: ${releaseId} - upload_url: ${uploadUrl}`);

        // Export variables to GitHub Actions environment
        fs.appendFileSync(GITHUB_ENV, `RELEASE_ID=${releaseId}\n`);
        fs.appendFileSync(GITHUB_ENV, `RELEASE_UPLOAD_URL=${uploadUrl}\n`);

    } catch (error) {
        console.error('Error creating release:', error.message);
        process.exit(1);
    }
}

createRelease();
