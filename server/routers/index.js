const routers = require('koa-router')()
const {
    getModel,
    addModel,
    delModel,
    updateModel,
    getSensor,
    addSensor,
    delSensor,
    updateSensor
} = require('./../controllers/model')
const {addSensorType, getSensorTypes} = require('./../controllers/sensor')
const {login, logout, register} = require('./../controllers/session')

routers.post('/model', addModel)
routers.delete('/model/:id', delModel)
routers.put('/model/:id', updateModel)
routers.get('/model/:id', getModel)
routers.get('/model', getModel)

routers.get('/model/:modelId/sensor', getSensor)
routers.get('/model/:modelId/sensor/:sensorId', getSensor)
routers.post('/model/:modelId/sensor', addSensor)
routers.put('/model/:modelId/sensor/:sensorId', updateSensor)
routers.delete('/model/:modelId/sensor/:sensorId', delSensor)

routers.post('/login', login)
routers.post('/register', register)
routers.get('/logout', logout)

routers.post('/gis/sensor/addSensorType', addSensorType)
routers.post('/gis/sensor/getAllSensorTypes', getSensorTypes)

module.exports = routers
