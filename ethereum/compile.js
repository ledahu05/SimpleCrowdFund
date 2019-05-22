const path = require('path');
const fs = require('fs-extra');
const solc = require('solc');

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf8');
//console.log(source);
const compiled = solc.compile(source, 1);
console.log(compiled);
const output = compiled.contracts;

console.log(output);
fs.ensureDirSync(buildPath);
for(let contract in output) {
    let name = contract.replace(':', '');
    fs.outputJSONSync(
        path.resolve(buildPath, name + '.json'),
        output[contract]
    );
}
