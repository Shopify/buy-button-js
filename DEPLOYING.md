## Deploying and publishing BuyButton.js

Pull from master and install all dependencies
```
git pull origin master
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
git push origin master --tags
```

Then deploy to S3 and NPM via [Shipit](https://shipit.shopify.io/shopify/buy-button-js/production)
