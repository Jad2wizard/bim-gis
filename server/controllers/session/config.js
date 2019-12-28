const MAX_AGE = 60 * 60 //秒
const ignorePath = ['/__webpack_hmr', '/favicon.ico', '/login', 'logout']
const ignoreFuzzyPath = ['hot-update', '/record-file', '/register', 'model']
const sessionConfig = {
    httpOnly: false,
    maxAge: MAX_AGE * 1000,
    // maxAge: 24 * 60 * 60 * 1000,
    key: 'bimGIS:sess'
}

module.exports = {
    MAX_AGE,
    ignoreFuzzyPath,
    ignorePath,
    sessionConfig
}
