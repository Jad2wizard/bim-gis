const routers = require('koa-router')()
const {
	getModel,
	addModel,
	delModel,
	updateModel,
	getMarker,
	addMarker,
	delMarker,
	updateMarker
} = require('./../controllers/model')
const {login, logout, register} = require('./../controllers/session')

routers.post('/model', addModel)
routers.delete('/model/:id', delModel)
routers.put('/model/:id', updateModel)
routers.get('/model/:id', getModel)
routers.get('/model', getModel)

routers.get('/model/:modelId/marker', getMarker)
routers.get('/model/:modelId/marker/:markerId', getMarker)
routers.post('/model/:modelId/marker', addMarker)
routers.put('/model/:modelId/marker/:markerId', updateMarker)
routers.delete('/model/:modelId/marker/:markerId', delMarker)

routers.post('/login', login)
routers.post('/register', register)
routers.get('/logout', logout)

module.exports = routers
