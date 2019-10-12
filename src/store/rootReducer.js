/**
 * Created by yaojia on 2019/4/13.
 */
import { combineReducers } from 'redux'
import sessionState from './../Pages/Session/reducer'
import { routerReducer } from 'react-router-redux'

export default combineReducers({
    routing: routerReducer,
    sessionState
})
