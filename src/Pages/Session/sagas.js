/**
 * Created by Jad_PC on 2018/2/6.
 */
import { all, take, call, put, fork } from 'redux-saga/effects'
import { routerActions } from 'react-router-redux'
import * as actions from './actions'
import { message } from 'antd'
import fetchProxy from './../../utils/fetchProxy'

window.message = message
const delay = time =>
    new Promise(res => {
        setTimeout(res, time)
    })
const loginUrl = `/login`
const logoutUrl = `/logout`
const registerUrl = `/register`

window.routerActions = routerActions
function* login({ username, password }) {
    try {
        yield delay(500)
        let result = yield call(fetchProxy, loginUrl, {
            method: 'POST',
            contentType: 'application/json',
            payload: { username, password }
        })
        yield put(actions.login('receive', result))
        //登录成功后控制页面跳转至登录前的页面
        let nextUrl = location.href.split('nextUrl=')[1] || null
        nextUrl = nextUrl ? decodeURIComponent(nextUrl) : '/'
        if (nextUrl.startsWith('/api/')) {
            //如果登录前访问的是/api接口，则直接将页面url跳转至该接口，因为前端路由中不含有/api接口，会跳转至404页面
            window.location.href = location.origin + nextUrl
        } else {
            yield put(routerActions.push(nextUrl))
        }
    } catch (err) {
        message.error(err.toString())
        yield put(actions.login('error', err.toString()))
    }
}

function* logout() {
    try {
        yield call(fetchProxy, logoutUrl)
        yield put(actions.logout('receive'))
        yield put(routerActions.push('/login'))
    } catch (err) {
        message.error(err)
        yield put(actions.logout('error', err))
    }
}

function* register({ username, password }) {
    try {
        let result = yield call(fetchProxy, registerUrl, {
            method: 'POST',
            contentType: 'application/json',
            payload: { name: username, password }
        })
        message.success(result.message)
        yield put(routerActions.push('/login'))
    } catch (err) {
        message.error(err)
    }
}

function* watchLogin() {
    while (true) {
        const { username, password } = yield take(actions.LOGIN_REQUEST)
        yield fork(login, { username, password })
    }
}

function* watchLogout() {
    while (true) {
        yield take(actions.LOGOUT_REQUEST)
        yield fork(logout)
    }
}

function* watchRegister() {
    while (true) {
        const { username, password } = yield take(actions.REGISTER_REQUEST)
        yield fork(register, { username, password })
    }
}

export default function* sessionSaga() {
    yield all([call(watchLogin), call(watchLogout), call(watchRegister)])
}
