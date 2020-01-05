const fs = require('fs')
const path = require('path')
const moment = require('moment')
const unzip = require('unzip')
const {rmdirSync} = require('../utils')

const modelTempStoreRoot = path.resolve(__dirname, './../../res/data/models')

const dumpModelData = (modelPath, id) => {
    const res = {}
    if (!fs.existsSync(modelPath)) throw new Error('模型不存在')
    const metadataPath = path.resolve(modelPath, 'metadata.json')
    if (!fs.existsSync(metadataPath)) throw new Error('模型信息文件不存在')
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
    for (let k in metadata) res[k] = metadata[k]
    return res
}

const getModel = async ctx => {
    try {
        // const user = ctx.session.username
        let res = []
        const id = ctx.params.id
        if (id) {
            const modelPath = path.resolve(modelTempStoreRoot, id)
            res.push(dumpModelData(modelPath, id))
        } else {
            for (let dir of fs.readdirSync(modelTempStoreRoot)) {
                if (dir.startsWith('.')) continue
                const modelPath = path.resolve(modelTempStoreRoot, dir)
                res.push(dumpModelData(modelPath, dir))
            }
        }

        // res = res.filter(m => m.user === user)
        res.sort((a, b) => (a.updateTime > b.updateTime ? -1 : 1))
        ctx.body = {
            message: '成功获取模型',
            data: res
        }
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const addModel = async ctx => {
    try {
        // const user = ctx.session.username
        const files = ctx.request.files
        const {name, type, desc, lat, lng} = ctx.request.body
        if (!name) throw new Error('缺少模型名称')
        if (!type) throw new Error('缺少模型类型')

        const json = {}
        json.id = moment().valueOf() + '_' + ((Math.random() * 1000) | 0)
        // json.user = user
        json.name = name
        json.type = type
        json.desc = desc || ''
        json.lng = lng
        json.lat = lat
        json.createTime = moment().valueOf()
        json.updateTime = moment().valueOf()

        const modelPath = path.resolve(modelTempStoreRoot, json.id)
        if (fs.existsSync(modelPath)) throw new Error('模型已存在')
        fs.mkdirSync(modelPath)

        if (files) {
            for (let filename in files) {
                const file = files[filename]

                if (filename !== 'zipFile') {
                    const writeFilePath = path.resolve(modelPath, file.name)
                    const reader = fs.createReadStream(file.path)
                    const writer = fs.createWriteStream(writeFilePath)
                    reader.pipe(writer)
                    json[filename] = `/data/models/${json.id}/${file.name}`
                } else {
                    const unzipPath = modelPath
                    fs.createReadStream(file.path).pipe(
                        unzip.Extract({path: unzipPath})
                    )
                }
            }
        }

        fs.writeFileSync(
            path.resolve(modelPath, 'metadata.json'),
            JSON.stringify(json)
        )

        const newModel = dumpModelData(
            path.resolve(modelTempStoreRoot, json.id),
            json.id
        )
        ctx.body = {
            message: '上传成功',
            data: newModel
        }
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const delModel = async ctx => {
    try {
        const id = ctx.params.id
        // const user = ctx.session.username
        if (!id) throw new Error('模型 id 缺失')

        const modelPath = path.resolve(modelTempStoreRoot, id)
        // const metadata = JSON.parse(
        //     fs.readFileSync(path.resolve(modelPath, 'metadata.json'), 'utf-8')
        // )
        // if (!user || !metadata.user || user !== metadata.user)
        //     throw new Error('无权删除该模型')
        if (!fs.existsSync(modelPath)) throw new Error('模型不存在')

        rmdirSync(modelPath)
        ctx.body = {
            message: '删除模型成功'
        }
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const updateModel = async ctx => {
    try {
        // const user = ctx.session.username
        const id = ctx.params.id
        const params = ctx.request.body
        const files = ctx.request.files

        if (!id) throw new Error('模型 id 缺失')

        const modelPath = path.resolve(modelTempStoreRoot, id)

        const metadataFilePath = path.resolve(modelPath, 'metadata.json')

        if (!fs.existsSync(metadataFilePath))
            throw new Error('模型的 metadata 数据不存在')

        const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'))
        // if (!user || !metadata.user || user !== metadata.user)
        //     throw new Error('无权删除该模型')

        for (let key in params) {
            metadata[key] = params[key]
        }

        //update files
        for (let filename in files) {
            const file = files[filename]

            if (metadata[filename]) {
                const filePath = path.resolve(
                    global.resDir,
                    '.' + metadata[filename]
                )
                rmdirSync(filePath)
            }

            const writeFilePath = path.resolve(modelPath, file.name)
            const reader = fs.createReadStream(file.path)
            const writer = fs.createWriteStream(writeFilePath)
            reader.pipe(writer)
            metadata[filename] = `/data/models/${id}/${file.name}`
        }

        metadata.updateTime = moment().valueOf()
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata))

        ctx.body = {
            message: '修改模型成功',
            data: metadata
        }
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const getSensor = async ctx => {
    try {
        const {modelId, sensorId} = ctx.params
        if (!modelId) throw '缺少标记所属的模型id'
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const addSensor = async ctx => {
    try {
        const {modelId} = ctx.params
        if (!modelId) throw '缺少标记所属的模型id'
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const delSensor = async ctx => {
    try {
        const {modelId, sensorId} = ctx.params
        if (!modelId) throw '缺少标记所属的模型id'
        if (!sensorId) throw '缺少标记id'
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

const updateSensor = async ctx => {
    try {
        const {modelId, sensorId} = ctx.params
        if (!modelId) throw '缺少标记所属的模型id'
        if (!sensorId) throw '缺少标记id'
    } catch (e) {
        ctx.response.body = {message: e.toString()}
        ctx.status = 400
    }
}

module.exports = {
    getModel,
    addModel,
    delModel,
    updateModel,
    getSensor,
    addSensor,
    delSensor,
    updateSensor
}
