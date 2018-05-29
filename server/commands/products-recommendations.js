
const path = require('path')
const program = require('commander');

program
  .version('0.1.0')
  .usage('[options] <file ...>')
  .option('-l, --color [hexa string]', 'color from which recommendations will be explored')
  .option('-t, --tolerance [number]', 'degree of proximity')
  .parse(process.argv);

if (! program.color){
    console.error('the color is required. Please retry')
    process.exit(0)
}

require('./config');
// please DON'T use ES6 'import' instead of 'require' here : beacuse of hoisting, import would executed before dotenv
const  catalogService = require('../services/catalog/catalog.service.js')

catalogService.getProductsRecommendations(program.color, program.tolerance)
    .then(products_recommended => {
            process.stdout.write(JSON.stringify(products_recommended))
            process.stdout.write("\r\n")
            process.exit()
        })
    .catch((err) => {
        process.stdout.write('recommendations FAILED : '+ err.message)
        process.stdout.write("\r\n")
        process.exit(0)
    })
program.parse(process.argv);
