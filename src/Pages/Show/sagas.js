import {call, take, all, put} from 'redux-saga/effects'
import * as actions from './actions'
import {URL_MAP} from './../../utils'
import fetchProxy from './../../utils/fetchProxy'

function* watchFetchDeviceCodes() {
    while (true) {
        const {modelId} = yield take(actions.REQ_FETCH_DEVICE_CODES)
        try {
            if (!modelId) throw new Error('modelId undefined')
            const res = yield call(
                fetchProxy,
                URL_MAP.fetchDeviceCodesUrl + '123'
            )
            yield put(
                actions.fetchDeviceCodes('receive', {
                    deviceCodes: res.result.map(item => item.deviceCode)
                })
            )
        } catch (e) {
            yield put(actions.fetchDeviceCodes('error', {error: e.toString()}))
        }
    }
}

export default function*() {
    yield all([call(watchFetchDeviceCodes)])
}
