# Shopify Post Purchase

## Getting started

### Requirements

1. You must [download and install Node.js](https://nodejs.org/en/download/) if you don't already have it.
2. You must [create a Shopify partner account](https://partners.shopify.com/signup) if you don’t have one.
3. You must [create a development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) if you don’t have one.
4. You must [install a post-purchase Chrome extension](https://chrome.google.com/webstore/detail/shopify-post-purchase-dev/nenmcifhoegealiiblnpihbnjenleong) if you do not have.

## Local Development

### Install all dependencies
```shell
yarn
```

### Starting the app
```shell
yarn dev
```
> When you run the `dev` command, the CLI builds and serves your app. It also walks you through multiple configuration steps. If you've already run `dev` for this app, then some of these steps are skipped.

Once the app is served, copy the extension url and paste in the post-purchase Chrome extension.

### env file
Create the `.env` file from provided `.env.sample`, fill out all the information.

### Starting the development server
In the root folder
```shell
node index
```
> Development server will provide the product (specified in .env file) to show on post-purchase page

### Test the app
Place a test order in your development store and go through the checkout steps. The post-purchase UI is shown after the payment step but before the thank you page.