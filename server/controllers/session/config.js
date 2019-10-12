/**
 * Created by Jad_PC on 2018/3/1.
 */
const MAX_AGE = 60 * 60 * 24 //秒
const ignorePath = ['/__webpack_hmr', '/favicon.ico', '/login']
const ignoreFuzzyPath = ['hot-update', '/record-file', '/register']
const sessionConfig = {
    httpOnly: false,
    maxAge: 24 * 60 * 60 * 1000,
    key: 'Jad2Wizard:sess'
}

module.exports = {
    MAX_AGE,
    ignoreFuzzyPath,
    ignorePath,
    sessionConfig
}
