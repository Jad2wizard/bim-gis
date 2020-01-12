const routers = require('koa-router')()
const {
    getModel,
    addModel,
    delModel,
    updateModel
} = require('./../controllers/model')
const {
    addSensorType,
    getAllSensorTypes,
    addsensor,
    updateSensor,
    delSensor,
    getSensors
} = require('./../controllers/sensor')
const {login, logout, register} = require('./../controllers/session')

routers.post('/model', addModel)
routers.delete('/model/:id', delModel)
routers.put('/model/:id', updateModel)
routers.get('/model/:id', getModel)
routers.get('/model', getModel)

routers.post('/login', login)
routers.post('/register', register)
routers.get('/logout', logout)

routers.post('/gis/sensor/addSensorType', addSensorType)
routers.post('/gis/sensor/getAllSensorTypes', getAllSensorTypes)
routers.post('/gis/sensor/addsensor', addsensor)
routers.post('/gis/sensor/updateSensor', updateSensor)
routers.post('/gis/sensor/delSensor', delSensor)
routers.post('/gis/sensor/Sensors', getSensors)

module.exports = routers
