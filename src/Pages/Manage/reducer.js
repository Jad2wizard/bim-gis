import { combineReducers } from 'redux'
import * as actions from './actions'

const modelList = (state = [], action) => {
    switch (action.type) {
        case actions.REC_GET_MODEL:
            return action.modelList
        case actions.REC_ADD_MODEL:
            return [...state, action.model]
        case actions.REC_DEL_MODEL: {
            const nextState = [...state]
            nextState.splice(
                nextState.findIndex(m => m.id === action.modelId),
                1
            )
            return nextState
        }
        default:
            return state
    }
}

const getModelsLoading = (state = false, action) => {
    switch (action.type) {
        case actions.REQ_GET_MODEL:
            return true
        case actions.REC_GET_MODEL:
        case actions.ERR_GET_MODEL:
            return false
        default:
            return state
    }
}

const addModelsLoading = (state = false, action) => {
    switch (action.type) {
        case actions.REQ_ADD_MODEL:
            return true
        case actions.REC_ADD_MODEL:
        case actions.ERR_ADD_MODEL:
            return false
        default:
            return state
    }
}

const uploadVisible = (state = false, action) => {
    switch (action.type) {
        case actions.SET_UPLOAD_VISIBLE:
            return action.visible
        case actions.REC_ADD_MODEL:
            return false
        default:
            return state
    }
}

export default combineReducers({
    modelList,
    getModelsLoading,
    addModelsLoading,
    uploadVisible
})
