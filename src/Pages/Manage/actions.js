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

export const SET_UPLOAD_VISIBLE = '设置上传界面是否可见'
export const setUploadVisible = visible => ({
	type: SET_UPLOAD_VISIBLE,
	visible
})
