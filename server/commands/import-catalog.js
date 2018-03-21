
const path = require('path')
const program = require('commander');
 
program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-u, --url [string]', 'url to file')
  .parse(process.argv);
 
if (! program.url){
    console.error('the URL is required. Please retry')
    process.exit(0)
}


require('./config');
// please DON'T use ES6 'import' instead of 'require' here : beacuse of hoisting, import would executed before dotenv
const  catalogService = require('../services/catalog/catalog.service.js')

console.log('catalog to be imported is located here :- %s', program.url);

catalogService.importCatalog({ 
    url : program.url, 
    onSuccess : (result) => { 
        process.stdout.write('import SUCCESS :', JSON.stringify(result))
        process.stdout.write("\r\n")
        process.exit(0)
    }, 
    onFailed: (err) => {
        process.stdout.write('import FAILED : ', JSON.stringify(err))
        process.stdout.write("\r\n")
        process.exit(0)
    }
})


program.parse(process.argv)
