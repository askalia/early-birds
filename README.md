# Early Birds : products recommendation by color proximity

## 1. Prerequisites

### Stack

 - NodeJS
 - Express (+ [async.js](https://caolan.github.io/async/), [mongoose](http://mongoosejs.com), [axios](https://github.com/axios/axios), [joi](https://www.npmjs.com/package/joi), [rgb-hex](https://github.com/sindresorhus/rgb-hex), [bluebird](https://github.com/petkaantonov/bluebird), ...)
 - [colour-proximity](https://github.com/gausie/colour-proximity)
 - mongoDB (hosted at [mlab.com](https://www.mlab.com))
 - Google Cloud Vision API

mongoDB server is alrealdy 

### Versions
 - node 8.6.0
 - npm 5.6.0
 - yarn 1.3.2



### Check your own versions : 

    node -v && npm -v && yarn -v
    // 8.6.0
    // 5.6.0
    // 1.3.2

### If you don't have yarn installed

    npm i -g yarn

## 2. Installation

    cd to /path/to/project

### 2.1. Environment config
Fetch config files (unversioned) from Dropbox online folder that was shared with you :
 1. *.env*
 2. *early-birds-f35c8586d088.json*

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

# Features available

### 1. Import catalog
    POST / http://localhost:3000/api/catalog/import
    url = url/to/catalog.csv

### 2. Grab dominant color for every product in the catalog
    GET : http://localhost:3000/api/catalog/update/colors
    no arguments not be passed as GET

### 3. Ask for all products with nearest given dominant color
    GET http://localhost:3000/api/catalog/recommend/by-color
    color=<hexa color> | < rgb color>

