import https from 'https';

export const postToGitHubDispatch = async () => {
    const {
        PAT_TOKEN,
        REPO_API_URL,
        VERSION,
        LABEL,
        LABEL_FR,
        DESCRIPTION,
        DESCRIPTION_FR,
        REPO_WEB_URL
    } = process.env;

    if (!PAT_TOKEN || !REPO_API_URL || !VERSION) {
        console.error('🔴 Error: Missing required environment variables.');
        process.exit(1);
    }

    const data = JSON.stringify({
        event_type: 'push-new-version',
        client_payload: {
            version: VERSION,
            label: LABEL,
            label_fr: LABEL_FR,
            description: DESCRIPTION,
            description_fr: DESCRIPTION_FR,
            note: `${REPO_WEB_URL}/releases/tag/v${VERSION}`,
            download: `${REPO_WEB_URL}/releases/download/v${VERSION}/chicken-bot.exe`,
        },
    });

    const options = {
        hostname: new URL(REPO_API_URL).hostname,
        path: new URL(REPO_API_URL).pathname + '/dispatches',
        method: 'POST',
        headers: {
            'Authorization': `token ${PAT_TOKEN}`,
            'User-Agent': 'GitHub-Actions-NodeJS-Script',
            'Accept': 'application/vnd.github.everest-preview+json',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
        },
    };

    const sendRequest = () =>
        new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let responseBody = '';
                res.on('data', (chunk) => {
                    responseBody += chunk;
                });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(responseBody);
                    } else {
                        reject(
                            new Error(
                                `Request failed with status ${res.statusCode}: ${responseBody}`
                            )
                        );
                    }
                });
            });

            req.on('error', (err) => reject(err));
            req.write(data);
            req.end();
        });

    try {
        const response = await sendRequest();
        console.log('✅ Successfully dispatched event to GitHub:');
        console.log(response);
    } catch (error) {
        console.error(`🔴 Error: ${error.message}`);
        process.exit(1);
    }
};

export const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const fetch = (url, token) =>
    new Promise((resolve, reject) => {
        const options = {
            method: 'GET',
            headers: {
                Authorization: `token ${token}`,
                'User-Agent': 'GitHub-Actions-NodeJS-Script'
            },
        };

        const req = https.request(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.end();
    });

export const waitForCompletion = async () => {
    const {
        PAT_TOKEN,
        REPO_API_URL,
    } = process.env;

    if (!PAT_TOKEN || !REPO_API_URL) {
        console.error('🔴 Error: Missing required environment variables.');
        process.exit(1);
    }

    const workflowName = 'push-new-version';
    let runId = null;

    console.log(`ℹ️ Waiting for workflow "${workflowName}" to start...`);

    // Poll for the workflow run ID
    while (!runId) {
        try {
            const response = await fetch(
                `${REPO_API_URL}/actions/runs?event=repository_dispatch&status=in_progress`,
                PAT_TOKEN
            );

            const workflowRuns = response.workflow_runs || [];
            const matchingRun = workflowRuns.find(
                (run) => run.display_title === workflowName
            );

            if (matchingRun) {
                runId = matchingRun.id;
            } else {
                console.log('Waiting for workflow run ID...');
                await timeout(3000);
            }
        } catch (error) {
            console.error(`🔴 Error fetching workflow runs: ${error.message}`);
            process.exit(1);
        }
    }

    console.log(`ℹ️ Workflow ID: ${runId}`);

    // Poll for the workflow completion status
    let conclusion = null;
    while (!conclusion || conclusion === 'in_progress') {
        try {
            const response = await fetch(
                `${REPO_API_URL}/actions/runs/${runId}`,
                PAT_TOKEN
            );

            conclusion = response.conclusion;
            if (conclusion === 'success') {
                console.log('✅ Workflow completed successfully.');
                break;
            } else if (conclusion === 'failure') {
                console.error('🔴 The workflow FAILED.');
                process.exit(1);
            } else if (conclusion === 'cancelled') {
                console.error('🚫 The workflow was CANCELLED.');
                process.exit(1);
            } else {
                console.log('Waiting for the workflow to complete...');
                await timeout(10000);
            }
        } catch (error) {
            console.error(`🔴 Error fetching workflow status: ${error.message}`);
            process.exit(1);
        }
    }
};
