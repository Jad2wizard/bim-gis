/**
 * running all the saga tasks in parallel
 * Created by yaojia on 2019/4/13.
 */

import { all, call } from 'redux-saga/effects'
import sessionSagas from './../Pages/Session/sagas'
import ManageSagas from './../Pages/Manage/sagas'

export default function*() {
    yield all([call(sessionSagas), call(ManageSagas)])
}
