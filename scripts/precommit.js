const fs = require('fs');
const shelljs = require('shelljs');
const resolve = require('path').resolve;

const logFile = resolve(__dirname, '../diff.log');

let data = fs.readFileSync(logFile).toString();

let files = data.split('\n').filter(f => {
    return f && !f.startsWith('D');
}).map(f => {
    return f.split('\t')[1];
});

let srcFiles = files.filter(f => {
    return f.startsWith('src') && (f.endsWith('.js') || f.endsWith('.jsx'));
})

if(srcFiles.length > 0){
    let command = `eslint --quiet ${srcFiles.join(' ')}`;

    let result = shelljs.exec(command);

    if(result.code === 1) {
        process.exit(1);
    }else{
        process.exit(0);
    }
} else {
    process.exit(0);
}

