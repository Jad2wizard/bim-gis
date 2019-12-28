const fs = require('fs')
const path = require('path')
const moment = require('moment')
const {rmdirSync} = require('../utils')

const sensorTempStoreRoot = path.resolve(__dirname, './../../res/data/sensors')

const addSensorType = async ctx => {
    try {
        const files = ctx.request.files
        const {sensor_name, use_id} = ctx.request.body
        const sensorPath = path.resolve(sensorTempStoreRoot, name)

        if (!sensor_name) throw new Error('缺少传感器类型名称')
        if (!use_id) throw new Error('缺少上传用户的 ID')
        if (!files) throw new Error('传感器模型文件缺失')

        if (fs.existsSync(sensorPath)) rmdirSync(sensorPath)
        fs.mkdirSync(sensorPath)

        const json = {
            sensor_type: sensor_name,
            use_id
        }
        json.id = moment().valueOf() + '_' + ((Math.random() * 1000) | 0)

        for (let filename in files) {
            const file = files[filename]

            const writeFilePath = path.resolve(sensorPath, file.name)
            const reader = fs.createReadStream(file.path)
            const writer = fs.createWriteStream(writeFilePath)
            reader.pipe(writer)
            json[filename] = `/data/sensors/${json.id}/${file.name}`
        }

        fs.writeFileSync(
            path.resolve(sensorPath, 'metadata.json'),
            JSON.stringify(json)
        )

        const data = {
            sensor_type_id: json.id,
            sensor_type: sensor_name
        }
        if (json.sensor_model_file)
            data.sensor_file_url = json.sensor_model_file
        if (json.sensor_model_mtl) data.sensor_mtl_url = json.sensor_model_mtl
        if (json.sensor_model_pic) data.sensor_pic_url = json.sensor_model_pic

        ctx.body = {
            message: '上传成功',
            data
        }
    } catch (e) {
        ctx.response.body = {
            error_code: 500,
            message: e.toString()
        }
        ctx.status = 200
    }
}

const getSensorTypes = async ctx => {
    try {
        const list = []
        for (let dir of fs.readdirSync(sensorTempStoreRoot)) {
            const item = {}
            if (dir.startsWith('.')) continue
            const sensorPath = path.resolve(sensorTempStoreRoot, dir)
            const metadataPath = path.resolve(sensorPath, 'metadata.json')
            if (!fs.existsSync(metadataPath))
                throw new Error('metadata文件不存在')
            const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
            for (let k in metadata) item[k] = metadata[k]
            list.push(item)
        }

        ctx.body = {
            error_code: 0,
            data: {
                message: '查询成功',
                sensor_type_ids: list.map(i => i.id),
                sensor_type_names: list.map(i => i.sensor_type),
                sensor_file_urls: list.map(i => i.sensor_model_file),
                sensor_mtl_urls: list.map(i => i.sensor_model_mtl),
                sensor_pic_urls: list.map(i => i.sensor_model_pic)
            }
        }
    } catch (e) {
        ctx.response.body = {
            error_code: 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = 200
    }
}
module.exports = {
    addSensorType,
    getSensorTypes
}
