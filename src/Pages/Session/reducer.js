/**
 * Created by Jad_PC on 2018/2/6.
 */

import { combineReducers } from 'redux'
import * as actions from './actions'

const user = (state = null, action) => {
    switch (action.type) {
        case actions.LOGIN_RECEIVE:
            return action.user.username
        case actions.LOGOUT_RECEIVE:
            return null
        default:
            return state
    }
}

const isLoading = (state = false, action) => {
    switch (action.type) {
        case actions.LOGIN_REQUEST:
        case actions.LOGOUT_REQUEST:
            return true
        case actions.LOGIN_RECEIVE:
        case actions.LOGIN_ERROR:
        case actions.LOGOUT_RECEIVE:
        case actions.LOGOUT_ERROR:
            return false
        default:
            return state
    }
}

const sessionState = combineReducers({
    isLoading,
    user
})

export default sessionState
