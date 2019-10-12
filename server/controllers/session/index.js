const fs = require('fs')
const path = require('path')
const session = require('koa-session')
const moment = require('moment')
const {
    MAX_AGE,
    sessionConfig,
    ignorePath,
    ignoreFuzzyPath
} = require('./config')

const userListPath = path.resolve(__dirname, './userList.json')
//从文件中获取已经注册的用户map
const userList = JSON.parse(fs.readFileSync(userListPath), 'utf-8')

/**
 * 判断当前请求是否需要进行登录验证
 * @param {*} ctx
 * @return {boolean}
 */
const isNeedLogin = ctx => {
    if (ignorePath.includes(ctx.path)) {
        return false
    }
    return !ignoreFuzzyPath.some(p => {
        if (ctx.path.includes(p)) {
            return true
        }
        return false
    })
}

const setSession = app => {
    app.keys = ['a secret key']
    app.use(session(sessionConfig, app))
    app.use(async (ctx, next) => {
        if (isNeedLogin(ctx)) {
            const sessionId = ctx.session.sessionId
            if (sessionId) {
                const username = sessionId.split('_')[0]
                const user = userList[username]
                if (user) {
                    if (Number(sessionId.split('_')[1]) < moment().valueOf()) {
                        ctx.session = null
                        ctx.response.redirect(
                            `/login?nextUrl=${encodeURIComponent(ctx.path)}`
                        )
                    }
                } else {
                    ctx.response.redirect(
                        `/login?nextUrl=${encodeURIComponent(ctx.path)}`
                    )
                }
            } else {
                ctx.response.redirect(
                    `/login?nextUrl=${encodeURIComponent(ctx.path)}`
                )
            }
        }
        await next()
    })
}

const login = async ctx => {
    try {
        const username = ctx.request.body.username
        const password = ctx.request.body.password
        if (!username || !password) throw new Error('用户名或密码缺失')

        const user = userList[username]
        if (!user) throw new Error('该用户不存在')
        if (user.password != password) throw new Error('密码错误')

        const sessionId =
            user.name +
            '_' +
            moment()
                .add(MAX_AGE, 'second')
                .valueOf()
        ctx.session.sessionId = sessionId
        ctx.body = { username: user.name }
    } catch (err) {
        ctx.response.body = { message: err.toString() }
        ctx.status = 400
    }
}

const register = async ctx => {
    try {
        const name = ctx.request.body.name
        const password = ctx.request.body.password

        let user = userList[name]
        if (user) throw new Error('用户名已存在')

        userList[name] = {
            name,
            password
        }

        fs.writeFileSync(userListPath, JSON.stringify(userList))
        ctx.body = {
            message: '注册成功'
        }
    } catch (err) {
        ctx.response.body = { message: err.toString() }
        ctx.status = 400
    }
}

const logout = async ctx => {
    try {
        ctx.session.sessionId = null
        ctx.body = {
            message: '登出成功'
        }
    } catch (err) {
        ctx.response.body = { message: err.toString() }
        ctx.status = 400
    }
}

const getUser = async ctx => {
    const sessionId = ctx.session.sessionId
    if (sessionId) {
        const user = userList[sessionId.split('_')[0]]
        return user ? { user: user.name } : null
    }
    return null
}

module.exports = {
    setSession,
    getUser,
    login,
    logout,
    register
}
