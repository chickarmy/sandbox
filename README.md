# sandbox

This sandbox repository is used to
- test inter-repository GitHub actions workflow,
- test some GitHub actions use-case.

## push via PR example
`push_via_PR_example.yml` [yaml](.github/workflows/push_via_PR_example.yml) - steps :
- some new code is created
- a PR is created with this new code
- expect at least 1 PR check to start, then expect all checks to complete in success
- merge PR

NB: [additionnal draft](.github/workflows/push_via_PR_example_ghscript_draft.yml) shows some alternatives using pure `actions/github-script` based steps

## publish sample
`publish_sample.yml` [yaml](.github/workflows/publish_sample.yml) - steps :
- read in current repo the release meta-info (versions.yml)
- prepare in current repo the release content (package)
- push to remote public web repo the release definition (version, description...)
- wait for remote workflow end with success
- create a new release draft of public web repo
- upload and attach package to the public release
- publish draft release
- let report release links, and download links

## read package.json version
`read_package_version.yml` [yaml](.github/workflows/read_package_version.yml) - steps :
- read version from [`package.json`](./package.json)
- echo package version

## read versions yaml
`read_version.yml` [yaml](.github/workflows/read_version.yml) - steps :
- read versions from [`versions.yml`](./versions.yml) and select target version entry
- echo version details

## main
`main.yml` [yaml](.github/workflows/main.yml) - steps :
- 10 sec wait

=> triggered on `main` push or PR

NB: this workflow is triggered by push and pull request and is used to have 1 check running on PR creation required by `push via PR example`