## Deploying and publishing BuyButton.js

Pull from main and install all dependencies
```
git pull origin main
yarn install
```
Then run

```
npm version [patch|minor|major]
```

Which will do 3 things:

- update the version number in package.json
- create a commit
- create a tag

```
git push origin main --tags
```

Then deploy via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production)
