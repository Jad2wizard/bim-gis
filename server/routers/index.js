const routers = require('koa-router')()
const {
    getModel,
    addModel,
    delModel,
    updateModel
} = require('./../controllers/model')
const { login, logout, register } = require('./../controllers/session')

routers.post('/model', addModel)
routers.delete('/model/:id', delModel)
routers.put('/model/:id', updateModel)
routers.get('/model/:id', getModel)
routers.get('/model', getModel)

routers.post('/login', login)
routers.post('/register', register)
routers.get('/logout', logout)

module.exports = routers
