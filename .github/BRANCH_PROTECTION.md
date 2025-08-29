# Branch Protection Suggestions

Recommended settings for `main` in GitHub → Settings → Branches → Branch protection rules:

- Require a pull request before merging
  - Require approvals: 1 (or 2 for stricter reviews)
  - Require review from Code Owners: enabled
  - Dismiss stale approvals when new commits are pushed: enabled
- Require status checks to pass before merging
  - Select the job: `build-test` from the `CI` workflow
  - Require branches to be up to date before merging: enabled
- Require linear history: enabled
- Do not allow bypassing the above settings: enabled (as appropriate)
- Restrict who can push to matching branches: optional; typically allow only admins/bots

Notes
- The `CI` workflow runs lint, build, and tests via `npm run lint`, `npm run build`, `npm run test:run`.
- If you rename the workflow or job, update required checks accordingly.
- For release branches, copy the rule and adjust the branch pattern (e.g., `release/*`).

