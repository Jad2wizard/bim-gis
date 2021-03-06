import {all, take, call, put, fork} from 'redux-saga/effects'
import {message} from 'antd'
import * as actions from './actions'
import {MODEL_TYPE_FILE_MAP} from './../../utils'
import fetchProxy from './../../utils/fetchProxy'

function* getModel(id) {
    try {
        let url = '/model'
        if (id) url += `/${id}`
        const res = yield call(fetchProxy, url)
        yield put(actions.getModel('receive', {modelList: res.data}))
    } catch (e) {
        yield put(actions.getModel('error', {error: e.toString()}))
    }
}

function* delModel(id) {
    try {
        if (!id) throw new Error('缺少模型id')
        yield fetchProxy(`/model/${id}`, {
            method: 'DELETE',
            contentType: 'application/json'
        })
        yield put(actions.delModel('receive', {modelId: id}))
        message.success('删除模型成功')
    } catch (e) {
        yield put(actions.delModel('error', {error: e.toString()}))
        message.error('删除模型失败: ' + e.toString())
    }
}

function* addModel(model) {
    try {
        const {name, type} = model
        if (!name) throw new Error('请输入模型名称')
        const modelFileConfigList = MODEL_TYPE_FILE_MAP[type]
        for (let item of modelFileConfigList) {
            if (item.required && !model[item.key]) throw new Error(item.message)
        }
        const res = yield fetchProxy('/model', {
            method: 'POST',
            payload: model
        })
        yield put(actions.addModel('receive', {model: res.data}))
        message.success('上传模型成功')
    } catch (e) {
        yield put(actions.addModel('error', {error: e.toString()}))
        message.error('上传模型失败: ' + e.toString())
    }
}

function* updateModel(params) {
    try {
        const res = yield fetchProxy('/model/' + params.id, {
            method: 'PUT',
            payload: params
            // contentType: 'application/json'
        })
        if (res) {
            yield put(actions.updateModel('receive', {params}))
            message.success('更新模型成功')
        } else {
            throw res
        }
    } catch (e) {
        message.error('更新模型失败: ' + e.toString())
        yield put(actions.updateModel('error', {error: e.toString()}))
    }
}

function* watchUpdateModel() {
    while (true) {
        const {params} = yield take(actions.REQ_UPDATE_MODEL)
        yield fork(updateModel, params)
    }
}

function* watchGetModel() {
    while (true) {
        const {id} = yield take(actions.REQ_GET_MODEL)
        yield fork(getModel, id)
    }
}

function* watchAddModel() {
    while (true) {
        const {model} = yield take(actions.REQ_ADD_MODEL)
        yield fork(addModel, model)
    }
}

function* watchDelModel() {
    while (true) {
        const {modelId} = yield take(actions.REQ_DEL_MODEL)
        yield fork(delModel, modelId)
    }
}

export default function*() {
    yield all([
        call(watchGetModel),
        call(watchAddModel),
        call(watchDelModel),
        call(watchUpdateModel)
    ])
}
