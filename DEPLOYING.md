## Deploying and publishing a new version of BuyButton.js

If you just want to update docs and NOT publish any new versions of BuyButton.js (to the CDN or npm), you **must** include `[DOCS]` in your PR title.

If you do want to publish a new version of the app to the CDN and npm:

### 1. Pull from main and install all dependencies
```
git pull origin main
yarn install
```

### 2. Then run

```
npx changeset add
```

### 3. Commit your changes (manually) using git. 

**Do NOT bump the version manually in `package.json`.**

### 4. Push your changes
```
git push
```

### 5. Create a PR and merge it into `main`

This will automatically:
- Bump the version in `package.json`
- Create the tag in GitHub for the new version
- Publish the new version to npm

### 6. Deploy via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production)

Merging the PR will automatically publish the new version to npm, but the Shipit deploy is necessary to publish the new version to Shopify's CDN.

Press "Deploy" next to your changes once CI has passed, read and tick off the checkbox once you have read and verified the instructions, and create the deploy. Monitor it and verify it succeeds.

## Rollback instructions (to update `latest` version on CDN)
Follow these instructions if you ONLY want to update the `latest` CDN version (and prevent a new version of this package from being published to npm).

If you instead want to revert a change while also publishing a new version to npm, follow the "## Deploying and publishing a new version of BuyButton.js" instructions above.

1. `git checkout main`
2. `git checkout -b <branch-name>`
3. Revert the faulty code changes (eg: downgrade the version of a dependency in the package.json file if bumping its version caused issues)
4. In `package.json`, change the package version (on line 3) by appending a string like `-ROLLBACK` to the existing version number
    - Eg: `3.0.1` (original) --> `3.0.1-ROLLBACK`
5. Run `yarn install`
6. Stage and commit your changes
7. Run `git tag <new app version>` which will create a new tag and tag the commit you just created
    - Eg: if after step 4 the app's version is now `3.0.1-ROLLBACK`, you would run `git tag 3.0.1-ROLLBACK`
8. Run `git push` followed by `git push --tags`
9. Visit https://github.com/Shopify/buy-button-js/tags and verify that you see the tag you just created and pushed
10. Create a new PR with your branch's changes. 
> [!CAUTION]
> **IMPORTANT: **Your PR title must contain `[ROLLBACK]` if you ONLY want to update the `latest` CDN version (and prevent a new version of this package from being published to npm)
11. Merge your PR into main once it is approved
12. Visit https://shipit.shopify.io/shopify/buy-button-js/production and deploy your change to the CDN. Refer to step 6 in the deploy instructions (not step 6 in the rollback instructions) for more information.
13. Visit [Infra Central](https://infra-central.shopify.io/edge/purges) and purge the `latest` CDN cache
    - Press "New Purge"
    - Choose the "Url" option
    - Paste in `https://sdks.shopifycdn.com/buy-button/latest/buybutton.js`
    - Press "Create purge"