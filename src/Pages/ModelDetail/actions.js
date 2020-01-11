export const REQ_FETCH_DEVICE_CODES = '请求获取模型设备编号'
export const REC_FETCH_DEVICE_CODES = '成功获取模型设备编号'
export const ERR_FETCH_DEVICE_CODES = '获取模型设备编号失败'
export const fetchDeviceCodes = (status, {modelId, deviceCodes, error}) => {
    switch (status) {
        case 'request':
            return {type: REQ_FETCH_DEVICE_CODES, modelId}
        case 'receive':
            return {type: REC_FETCH_DEVICE_CODES, deviceCodes}
        case 'error':
            return {type: ERR_FETCH_DEVICE_CODES, error}
        default:
            return null
    }
}

export const REQ_ADD_SENSOR = '请求添加传感器'
export const REC_ADD_SENSOR = '成功添加传感器'
export const ERR_ADD_SENSOR = '添加传感器失败'
export const addSensor = (
    status,
    {modelId, sensorTypeId, deviceCode, position, angle, scale, sensor, error}
) => {
    switch (status) {
        case 'request':
            return {
                type: REQ_ADD_SENSOR,
                modelId,
                sensorTypeId,
                deviceCode,
                position,
                angle,
                scale,
                error
            }
        case 'receive':
            return {
                type: REC_ADD_SENSOR,
                sensor
            }
        case 'error':
            return {
                type: ERR_ADD_SENSOR,
                error
            }
    }
}
