import {combineReducers} from 'redux'
import * as actions from './actions'
import {SENSOR_TYPE_LIST} from './../../utils'

const deviceCodes = (state = [], action) => {
    switch (action.type) {
        case actions.REC_FETCH_DEVICE_CODES:
            return action.deviceCodes
        default:
            return state
    }
}

const sensorTypes = (state = SENSOR_TYPE_LIST, action) => {
    switch (action.type) {
        default:
            return state
    }
}

export default combineReducers({
    deviceCodes,
    sensorTypes
})
