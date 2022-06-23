const mergejson = require('mergejson');
const packageMergeJson = require('./packageMerge.json');
const packageJson = require('../package.json');
packageJson['peerDependencies'] = JSON.parse(JSON.stringify(packageJson['dependencies']));
delete packageJson['devDependencies'];
delete packageJson['dependencies'];
delete packageJson['scripts'];

const resultJson = mergejson(packageMergeJson, packageJson);

console.log(JSON.stringify(resultJson, null, 2));
