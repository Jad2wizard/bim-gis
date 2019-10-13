const fs = require('fs')
const path = require('path')
const moment = require('moment')
const { rmdirSync } = require('jadwizard-lib')

const modelTempStoreRoot = path.resolve(__dirname, './../../res/data/models')

const dumpModelData = (modelPath, id) => {
    const res = {}

    if (!fs.existsSync(modelPath)) throw new Error('模型不存在')
    for (let file of fs.readdirSync(modelPath)) {
        if (file == 'metadata.json') {
            const metadata = JSON.parse(
                fs.readFileSync(path.resolve(modelPath, file), 'utf-8')
            )
            for (let k in metadata) res[k] = metadata[k]
        } else {
            const filePath = path.resolve(modelPath, file)
            if (!fs.statSync(filePath).isFile()) {
                const fileList = fs.readdirSync(filePath)
                if (fileList.length > 0)
                    res[file] = `/data/models/${id}/${file}/${fileList[0]}`
            }
        }
    }

    return res
}

const getModel = async ctx => {
    try {
        const res = []
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
        ctx.body = {
            message: '成功获取模型',
            data: res
        }
    } catch (e) {
        ctx.response.body = { message: e.toString() }
        ctx.status = 400
    }
}

const addModel = async ctx => {
    try {
        const files = ctx.request.files
        const { name, type, desc } = ctx.request.body
        if (!name) throw new Error('缺少模型名称')
        if (!type) throw new Error('缺少模型类型')

        const json = {}
        json.id = moment().valueOf() + '_' + ((Math.random() * 1000) | 0)

        const modelPath = path.resolve(modelTempStoreRoot, json.id)
        if (fs.existsSync(modelPath)) throw new Error('模型已存在')
        fs.mkdirSync(modelPath)

        json.name = name
        json.type = type
        json.desc = desc || ''
        json.createTime = moment().valueOf()
        json.updateTime = moment().valueOf()
        fs.writeFileSync(
            path.resolve(modelPath, 'metadata.json'),
            JSON.stringify(json)
        )

        if (files) {
            for (let filename in files) {
                const file = files[filename]

                const writePath = path.resolve(modelPath, filename)
                fs.mkdirSync(writePath)

                const reader = fs.createReadStream(file.path)
                const filePath = path.resolve(writePath, file.name)
                const writer = fs.createWriteStream(filePath)
                reader.pipe(writer)
            }
        }

        const newModel = dumpModelData(
            path.resolve(modelTempStoreRoot, json.id),
            json.id
        )
        ctx.body = {
            message: '上传成功',
            data: newModel
        }
    } catch (e) {
        ctx.response.body = { message: e.toString() }
        ctx.status = 400
    }
}

const delModel = async ctx => {
    try {
        const id = ctx.params.id
        if (!id) throw new Error('模型 id 缺失')

        const modelPath = path.resolve(modelTempStoreRoot, id)
        if (!fs.existsSync(modelPath)) throw new Error('模型不存在')

        rmdirSync(modelPath)
        ctx.body = {
            message: '删除模型成功'
        }
    } catch (e) {
        ctx.response.body = { message: e.toString() }
        ctx.status = 400
    }
}

const updateModel = async ctx => {
    try {
        const id = ctx.params.id
        const params = ctx.request.body
        if (!id) throw new Error('模型 id 缺失')
        const metadataFilePath = path.resolve(
            modelTempStoreRoot,
            id,
            'metadata.json'
        )
        if (!fs.existsSync(metadataFilePath))
            throw new Error('模型的 metadata 数据不存在')

        const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'))
        for (let key in params) {
            metadata[key] = params[key]
        }
        metadata.updateTime = moment().valueOf()
        fs.writeFileSync(metadataFilePath, JSON.stringify(metadata))

        ctx.body = {
            message: '修改模型成功',
            data: metadata
        }
    } catch (e) {
        ctx.response.body = { message: e.toString() }
        ctx.status = 400
    }
}

module.exports = {
    getModel,
    addModel,
    delModel,
    updateModel
}
