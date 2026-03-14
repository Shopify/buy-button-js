# How to contribute

We ❤️ pull requests. If you'd like to fix a bug, contribute a feature or
just correct a typo, please feel free to do so, as long as you follow
our [Code of Conduct](https://github.com/Shopify/js-buy-sdk/blob/main/CODE_OF_CONDUCT.md).

If you're thinking of adding a big new feature, consider opening an
issue first to discuss it to ensure it aligns to the direction of the
project (and potentially save yourself some time!).

## Deploying and publishing

### Publishing a new version

1. Pull from main and install dependencies:
   ```
   git pull origin main
   pnpm install
   ```
2. Create a changeset describing your changes:
   ```
   pnpm exec changeset add
   ```
3. Commit the changeset file alongside your code changes. **Do NOT manually update `CHANGELOG.md`** — it is generated automatically from changesets.
4. Push and create a PR. **Do NOT bump the version in `package.json`** — changesets manages this.
5. Merge the PR into `main`. The release workflow will automatically create a release PR titled `[ci] release`.
6. Review the release PR — verify the version bump and `CHANGELOG.md` are correct.
7. Merge the release PR. The release workflow will automatically publish the new version to npm and create a GitHub release.
8. Deploy via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production) to publish the new version to Shopify's CDN. Press "Deploy", read and tick off the checkbox, then create and monitor the deploy.

### Non-release changes

If your PR doesn't need a new npm release (docs-only changes, test updates, CI changes, etc.), just don't include a changeset. No changeset = no release PR = no npm publish.

### Rollback (update `latest` CDN version)

Follow these steps to roll back the `latest` CDN version without publishing a normal npm release.

1. Create a branch from `main` and revert the faulty code changes
2. Do **not** include a changeset file
3. Append `-ROLLBACK` to the version in `package.json` (e.g., `3.0.6` → `3.0.6-ROLLBACK`)
4. Run `pnpm install` to update the lockfile
5. Stage and commit your changes
6. Create a tag matching the new version:
   ```
   git tag 3.0.6-ROLLBACK
   ```
7. Push the branch and tags:
   ```
   git push && git push --tags
   ```
8. Create and merge the PR
9. Deploy via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production)
10. Purge the CDN cache via [Infra Central](https://infra-central.shopify.io/edge/purges):
    - Press "New Purge" → choose "Url" → paste `https://sdks.shopifycdn.com/buy-button/latest/buybutton.js` → press "Create purge"

> [!CAUTION]
> The `-ROLLBACK` prerelease version will be published to npm. This is harmless — prerelease versions don't affect the `latest` dist-tag. **Never manually promote a prerelease to `latest`** via `npm dist-tag`.

> [!CAUTION]
> After a rollback, the next `changeset version` bumps from the rollback version normally. For example, `3.0.6-ROLLBACK` + a `patch` changeset → `3.0.7`. Verify the release PR shows the expected version before merging.
