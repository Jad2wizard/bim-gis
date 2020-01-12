class HttpError extends Error {
    constructor(props) {
        super(props)
        this.statusCode = props.statusCode || 500
        this.message = props.message || props
    }
    toString() {
        return this.message
    }
}

module.exports = {
    HttpError
}
