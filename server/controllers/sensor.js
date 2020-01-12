const fs = require('fs')
const path = require('path')
const moment = require('moment')
const {HttpError} = require('./../utils/Error')
const {
    sensorsPath,
    sensorTypeStoreRoot,
    modelTempStoreRoot
} = require('../utils')

const addSensorType = async ctx => {
    try {
        const files = ctx.request.files
        const {user_id, sensor_name} = ctx.request.body

        if (!sensor_name)
            throw new HttpError({
                message: '缺少传感器类型名称',
                statusCode: 400
            })
        if (!files.sensor_model_file)
            throw new HttpError({
                message: '缺少传感器模型文件',
                statusCode: 400
            })

        const json = {
            id: moment().valueOf() + '_' + ((Math.random() * 1000) | 0),
            sensor_type_name: sensor_name,
            user_id
        }

        const sensorPath = path.resolve(sensorTypeStoreRoot, json.id)
        fs.mkdirSync(sensorPath)

        for (let filename in files) {
            const file = files[filename]

            const writeFilePath = path.resolve(sensorPath, file.name)
            const reader = fs.createReadStream(file.path)
            const writer = fs.createWriteStream(writeFilePath)
            reader.pipe(writer)
            json[filename] = `/data/sensorTypes/${json.id}/${file.name}`
        }

        fs.writeFileSync(
            path.resolve(sensorPath, 'metadata.json'),
            JSON.stringify(json)
        )

        const data = {
            sensor_type_id: json.id
        }
        if (json.sensor_model_file)
            data.sensor_file_url = json.sensor_model_file
        if (json.sensor_model_mtl) data.sensor_mtl_url = json.sensor_model_mtl
        if (json.sensor_model_pic) data.sensor_pic_url = json.sensor_model_pic

        ctx.body = {
            error_code: 0,
            message: '上传成功',
            data
        }
    } catch (e) {
        ctx.response.body = {
            error_code: e.statusCode || 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

const getAllSensorTypes = async ctx => {
    try {
        const list = []
        for (let dir of fs.readdirSync(sensorTypeStoreRoot)) {
            const item = {}
            if (dir.startsWith('.')) continue
            const sensorPath = path.resolve(sensorTypeStoreRoot, dir)
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
                sensor_type_names: list.map(i => i.sensor_type_name),
                sensor_file_urls: list.map(i => i.sensor_model_file),
                sensor_mtl_urls: list.map(i => i.sensor_model_mtl),
                sensor_pic_urls: list.map(i => i.sensor_model_pic)
            }
        }
    } catch (e) {
        ctx.response.body = {
            error_code: e.statusCode || 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

const sensors = JSON.parse(fs.readFileSync(sensorsPath, 'utf-8'))

const addsensor = async ctx => {
    try {
        const {
            prod_id,
            sensor_type_id,
            displacement,
            angle,
            dimensions,
            channel_id
        } = ctx.request.body

        for (let k of ['displacement', 'angle', 'dimensions', 'channel_id'])
            if (!ctx.request.body[k])
                throw new HttpError({
                    statusCode: 400,
                    message: `参数${k}不存在`
                })

        const modelPath = path.resolve(modelTempStoreRoot, prod_id)
        if (!fs.existsSync(modelPath))
            throw new HttpError({statusCode: 400, message: '项目不存在'})

        const sensorTypePath = path.resolve(sensorTypeStoreRoot, sensor_type_id)
        if (!fs.existsSync(sensorTypePath))
            throw new HttpError({statusCode: 400, message: '传感器类型不存在'})

        const sensor_id =
            moment().valueOf() + '_' + ((Math.random() * 1000) | 0) + '_sensor'

        const sensor_data = {
            sensor_id,
            prod_id,
            sensor_type_id,
            displacement,
            angle,
            dimensions,
            channel_id
        }

        sensors[sensor_id] = sensor_data

        fs.writeFileSync(sensorsPath, JSON.stringify(sensors))

        ctx.body = {
            error_code: 0,
            data: {
                sensor_id,
                prod_id,
                sensor_type_id,
                displacement,
                angle,
                dimensions,
                channel_id
            }
        }
    } catch (e) {
        ctx.response.body = {
            error_code: e.statusCode || 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

const enableUpdateParams = ['displacement', 'angle', 'dimensions', 'channel_id']
const updateSensor = async ctx => {
    try {
        const params = ctx.request.body
        const {sensor_id} = params
        if (!sensor_id)
            throw new HttpError({statusCode: 400, message: '缺少传感器id'})

        const sensor = sensors[sensor_id]
        if (!sensor)
            throw new HttpError({statusCode: 400, message: '该传感器不存在'})

        for (let k in params) {
            if (enableUpdateParams.includes(k)) sensor[k] = params[k]
        }

        fs.writeFileSync(sensorsPath, JSON.stringify(sensors))

        ctx.body = {
            error_code: 0,
            data: {...sensor}
        }
    } catch (e) {
        ctx.response.body = {
            error_code: 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

const delSensor = async ctx => {
    try {
        console.log(ctx.request.body)
        const {sensor_id} = ctx.request.body
        if (!sensor_id)
            throw new HttpError({statusCode: 400, message: '缺少传感器id'})

        if (!sensors[sensor_id])
            throw new HttpError({statusCode: 400, message: '该传感器不存在'})

        delete sensors[sensor_id]

        fs.writeFileSync(sensorsPath, JSON.stringify(sensors))
        ctx.body = {
            data: {
                sensor_id,
                message: '删除成功'
            },
            error_code: 0
        }
    } catch (e) {
        ctx.response.body = {
            error_code: e.statusCode || 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

const getSensors = async ctx => {
    try {
        const {sensor_type_id, prod_id} = ctx.request.body
        const res = []
        for (let id in sensors) {
            const sensor = sensors[id]
            if (!sensor_type_id || sensor.sensor_type_id === sensor_type_id) {
                if (!prod_id || sensor.prod_id === prod_id) res.push(sensor)
            }
        }

        ctx.body = {
            error_code: 0,
            data: res
        }
    } catch (e) {
        ctx.response.body = {
            error_code: e.statusCode || 500,
            data: {
                message: e.toString()
            }
        }
        ctx.status = e.statusCode || 500
    }
}

module.exports = {
    addSensorType,
    getAllSensorTypes,
    addsensor,
    updateSensor,
    delSensor,
    getSensors
}
