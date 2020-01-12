const fs = require('fs')
const path = require('path')

const delay = (duration = 1000) =>
    new Promise(resolve => setTimeout(resolve, duration))

const rmdirSync = dir => {
    if (!fs.existsSync(dir)) return

    const fileinfo = fs.statSync(dir)
    if (fileinfo.isFile()) {
        fs.unlinkSync(dir)
    } else if (fileinfo.isDirectory()) {
        const files = fs.readdirSync(dir)
        for (let i = 0; i < files.length; i++)
            rmdirSync(path.join(dir, files[i]))
        fs.rmdirSync(dir)
    }
}

const dataRoot = path.resolve(__dirname, './../../res/data')

const modelTempStoreRoot = path.resolve(dataRoot, './models')

const sensorTypeStoreRoot = path.resolve(dataRoot, './sensorTypes')

const sensorsPath = path.resolve(dataRoot, './sensors.json')
if (!fs.existsSync(sensorsPath))
    fs.writeFileSync(sensorsPath, JSON.stringify({}))

module.exports = {
    delay,
    rmdirSync,
    sensorsPath,
    modelTempStoreRoot,
    sensorTypeStoreRoot
}
