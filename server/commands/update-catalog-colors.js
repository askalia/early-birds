
const path = require('path')
const program = require('commander');
 
program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-l, --limit [number]', 'number max of products to lookup')
  .parse(process.argv);
 

require('./config');
// please DON'T use ES6 'import' instead of 'require' here : beacuse of hoisting, import would executed before dotenv
const  catalogService = require('../services/catalog/catalog.service.js')

const { limit } = program
catalogService.updateColors({ limit })
    .then(results => {
        process.stdout.write(JSON.stringify(results))
        process.stdout.write("\r\n")
        process.exit()
    })
    .catch((err) => {
        process.stdout.write('update colors FAILED : '+ err.message)
        process.stdout.write("\r\n")
        process.exit(0)
    })

program.parse(process.argv)
