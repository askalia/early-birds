# Test tech : products recommendation by color proximity

## 1. Prerequisites

### Stack

 - NodeJS
 - Express (+ [async.js](https://caolan.github.io/async/), [mongoose](http://mongoosejs.com), [axios](https://github.com/axios/axios), [joi](https://www.npmjs.com/package/joi), [rgb-hex](https://github.com/sindresorhus/rgb-hex), [bluebird](https://github.com/petkaantonov/bluebird), ... --> check package.json)
 - [babel-node](https://babeljs.io/docs/usage/cli/)
 - [colour-proximity](https://github.com/gausie/colour-proximity)
 - mongoDB (hosted at [mlab.com](https://www.mlab.com))
 - Google Cloud [Vision API](https://cloud.google.com/vision/?hl=fr)

### Versions
 - node 8.6.0
 - npm 5.6.0
 - yarn 1.3.2
 - babel-node 6.26.0

### Check your own versions :

    node -v && npm -v && yarn -v && babel-node -V
    // 8.6.0
    // 5.6.0
    // 1.3.2
    // 6.26.0

### If you don't have yarn installed

    npm i -g yarn

## 2. Installation

    cd to /path/to/project

### 2.1. Environment config
Fetch config files (unversioned) from Dropbox online folder that was shared with you :
 1. *.env*
 2. *gcloud-f35c8586d088.json*

and put them at project root.

### 2.2. Install dependencies
    yarn install


## 3. Start the web-app
    yarn start

Wait for following message to appear :

> server started on port 3000 (development)

The app should now be available at :

    http://localhost:3000/api/health-check

    // should display : "OK"

# Web API

### 1. Import catalog
    POST / http://localhost:3000/api/catalog/import
    url = url/to/catalog.csv

### 2. Grab dominant color for every product in the catalog
    GET : http://localhost:3000/api/catalog/update/colors
    no arguments not be passed as GET

### 3. Ask for all products with nearest given dominant color
    GET http://localhost:3000/api/catalog/recommend/by-color
    color=<hexa color> | < rgb color>

### Swagger

Swagger webdoc API  up-coming

# CLI API
    cd server/commands

## Help

    babel-node import-catalog.js --help
    babel-node import-catalog-colors.js --help
    babel-node products-recommendation.js --help

### 1. Import catalog
    babel-node import-catalog.js --url https://url/to/csvfile

### 2. Grab dominant color for every product in the catalog
    babel-node update-catalog-colors
    --limit <limit: int> can be passed

### 3. Ask for all products with nearest given dominant color
    babel-node products-recommendation --color <#xxyyzz>
