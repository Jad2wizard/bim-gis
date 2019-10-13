import { all, take, call, put, fork } from 'redux-saga/effects'
import { message } from 'antd'
import * as actions from './actions'
import fetchProxy from './../../utils/fetchProxy'

function* getModel(id) {
    try {
        let url = '/model'
        if (id) url += `/${id}`
        const res = yield call(fetchProxy, url)
        yield put(actions.getModel('receive', { modelList: res.data }))
    } catch (e) {
        yield put(actions.getModel('error', { error: e.toString() }))
    }
}

function* addModel(model) {
    try {
        const { name, type, objFile } = model
        if (!name) throw new Error('请输入模型名称')
        if (type === 'obj') {
            if (!objFile) throw new Error('请选择 obj 文件')
            const res = yield fetchProxy('/model', {
                method: 'POST',
                payload: model
            })
            yield put(actions.addModel('receive', { model: res.data }))
            message.success('上传成功')
        }
    } catch (e) {
        message.error(e.toString())
        yield put(actions.addModel('error', { error: e.toString() }))
    }
}

function* watchGetModel() {
    while (true) {
        const { id } = yield take(actions.REQ_GET_MODEL)
        yield fork(getModel, id)
    }
}

function* watchAddModel() {
    while (true) {
        const { model } = yield take(actions.REQ_ADD_MODEL)
        yield fork(addModel, model)
    }
}

export default function*() {
    yield all([call(watchGetModel), call(watchAddModel)])
}
