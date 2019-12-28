export const REQ_GET_MODEL = '请求获取模型'
export const REC_GET_MODEL = '获取模型成功'
export const ERR_GET_MODEL = '获取模型失败'
export const getModel = (status, {id, modelList, error}) => {
    switch (status) {
        case 'request':
            return {type: REQ_GET_MODEL, id}
        case 'receive':
            return {type: REC_GET_MODEL, modelList}
        case 'error':
            return {type: ERR_GET_MODEL, error}
    }
}

export const REQ_ADD_MODEL = '请求添加模型'
export const REC_ADD_MODEL = '添加模型成功'
export const ERR_ADD_MODEL = '添加模型失败'
export const addModel = (status, {model, error}) => {
    switch (status) {
        case 'request':
            return {type: REQ_ADD_MODEL, model}
        case 'receive':
            return {type: REC_ADD_MODEL, model}
        case 'error':
            return {type: ERR_ADD_MODEL, error}
    }
}

export const REQ_UPDATE_MODEL = '请求更新模型'
export const REC_UPDATE_MODEL = '更新模型成功'
export const ERR_UPDATE_MODEL = '更新模型失败'
export const updateModel = (status, {params, error}) => {
    switch (status) {
        case 'request':
            return {type: REQ_UPDATE_MODEL, params}
        case 'receive':
            return {type: REC_UPDATE_MODEL, params}
        case 'error':
            return {type: ERR_UPDATE_MODEL, error}
    }
}

export const REQ_DEL_MODEL = '请求删除模型'
export const REC_DEL_MODEL = '删除模型成功'
export const ERR_DEL_MODEL = '删除模型失败'
export const delModel = (status, {modelId, error}) => {
    switch (status) {
        case 'request':
            return {type: REQ_DEL_MODEL, modelId}
        case 'receive':
            return {type: REC_DEL_MODEL, modelId}
        case 'error':
            return {type: ERR_DEL_MODEL, error}
    }
}

export const SET_MODEL_UPLOAD_VISIBLE = '设置模型上传界面是否可见'
export const setModelUploadVisible = visible => ({
    type: SET_MODEL_UPLOAD_VISIBLE,
    visible
})

export const SET_SENSOR_UPLOAD_VISIBLE = '设置传感器类型上传界面是否可见'
export const setSensorUploadVisible = visible => ({
    type: SET_SENSOR_UPLOAD_VISIBLE,
    visible
})

// export const REQ_GET_SENSOR_TYPE = '请求获取传感器类型列表'
// export const REC_GET_SENSOR_TYPE = '获取传感器类型列表成功'
// export const ERR_GET_SENSOR_TYPE = '获取传感器类型列表失败'
// export const getSensorTypes = (status, {sensorTypeList, error}) => {
//     switch (status) {
//         case 'request':
//             return {type: REQ_GET_SENSOR_TYPE}
//         case 'receive':
//             return {type: REC_GET_SENSOR_TYPE, sensorTypeList}
//         case 'error':
//             return {type: ERR_GET_SENSOR_TYPE, error}
//     }
// }

// export const REQ_ADD_SENSOR_TYPE = '请求添加传感器类型'
// export const REC_ADD_SENSOR_TYPE = '添加传感器类型成功'
// export const ERR_ADD_SENSOR_TYPE = '添加传感器类型失败'
// export const addSensorType = (status, {sensorType, error}) => {
//     switch (status) {
//         case 'request':
//             return {type: REQ_ADD_SENSOR_TYPE, sensorType}
//         case 'receive':
//             return {type: REC_ADD_SENSOR_TYPE, sensorType}
//         case 'error':
//             return {type: ERR_ADD_SENSOR_TYPE, error}
//     }
// }
