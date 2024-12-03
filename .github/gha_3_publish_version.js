import {checkGithubVersionAndExport, exportMatchingVersionData, readPackageVersion} from "./jsLib/versionHelper.js";
import {produceFakeFilename} from "./jsLib/packagingHelper.js";
import {postToGitHubDispatch, waitForCompletion} from "./jsLib/githubApiHelper.js";

/**
 * requirements:
 * (env)
 * env.VERSION
 * env.LABEL
 * env.LABEL_FR
 * env.DESCRIPTION
 * env.DESCRIPTION_FR
 * RELEASE_EXE_FILE
 * REPO_API_URL,
 * REPO_WEB_URL
 * PAT_TOKEN
 */

await postToGitHubDispatch(process.env.VERSION)
await waitForCompletion()