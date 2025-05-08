## Deploying and publishing a new version of BuyButton.js

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
git push origin main
```

### 5. Create a PR and merge it into `main`

This will automatically:
- Bump the version in `package.json`
- Create the tag in GitHub for the new version
- Publish the new version to npm

### 6. Deploy via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production)

Merging the PR will automatically publish the new version to npm, but the Shipit deploy is necessary to publish the new version to Shopify's CDN.
