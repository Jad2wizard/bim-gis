/**
 * Created by yaojia7 on 2018/9/14.
 */
import React from 'react'
import ReactDOM from 'react-dom'
import {Router, Route, Redirect, browserHistory} from 'react-router'
import {syncHistoryWithStore} from 'react-router-redux'
import {Provider} from 'react-redux'
import Home from './Pages/Home'
import Manage from './Pages/Manage'
import Show from './Pages/Show'
// import GIS from './Pages/GIS'
import Login from './Pages/Session/Login'
import Register from './Pages/Session/Register'
import NotFoundPage from './Pages/NotFoundPage'
import store from './store'

const history = syncHistoryWithStore(browserHistory, store)

/* eslint-disable */
if (module.hot) {
	module.hot.accept()
}
/* eslint-enable */

//routers
const routes = (
	<Route>
		<Route path="/login" component={() => <Login />} />
		<Route path="/register" component={() => <Register />} />
		<Route path="/" component={props => <Home {...props} />}>
			<Route path="/manage" component={() => <Manage />} />
			<Route path="/show" component={() => <Show />} />
			<Route path="/help" component={() => <div>帮助</div>} />
			<Route path="/404" component={() => <NotFoundPage />} />
			<Redirect from="*" to="/404" />
		</Route>
	</Route>
)

const Routers = () => <Router history={history}>{routes}</Router>

ReactDOM.render(
	<Provider store={store}>
		<Routers />
	</Provider>,
	document.querySelector('#main')
)
