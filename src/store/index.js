/**
 * Created by yaojia on 2019/4/12.
 */
import { createStore, applyMiddleware } from 'redux'
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import createSagaMiddleware from 'redux-saga'
import { createLogger } from 'redux-logger'
import rootReducer from './rootReducer'
import rootSaga from './rootSaga'

const sagaMiddleware = createSagaMiddleware()
const routeMiddleware = routerMiddleware(browserHistory)
const middlewares = [sagaMiddleware, routeMiddleware, createLogger()]

/* eslint-disable */
const store = createStore(rootReducer, applyMiddleware(...middlewares))
window.store = store

if (module.hot) {
    module.hot.accept('./rootReducer', () => {
        const nextRootReducer = require('./rootReducer')
        store.replaceReducer(nextRootReducer)
    })
}
/* eslint-enable */

sagaMiddleware.run(rootSaga)

export default store
