/**
 * Created by yaojia on 2019/4/13.
 */
import {combineReducers} from 'redux'
import {routerReducer} from 'react-router-redux'
import sessionState from './../Pages/Session/reducer'
import manageState from './../Pages/Manage/reducer'
import modelState from './../Pages/Show/reducers'

export default combineReducers({
    routing: routerReducer,
    sessionState,
    manageState,
    modelState
})
