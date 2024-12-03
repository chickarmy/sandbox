import {checkGithubVersionAndExport, exportMatchingVersionData, readPackageVersion} from "./jsLib/versionHelper.js";
import {produceFakeFilename} from "./jsLib/packagingHelper.js";
import {postToGitHubDispatch, waitForCompletion} from "./jsLib/githubApiHelper.js";

/**
 * requirements:
 * (file)
 * ./versions.yml
 * (env)
 * GITHUB_REF_NAME : provided by GHA
 */

const version = readPackageVersion();
const envVersion = checkGithubVersionAndExport(version);
exportMatchingVersionData(envVersion);
