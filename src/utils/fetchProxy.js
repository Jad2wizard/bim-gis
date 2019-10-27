const doFetch = (url, param = {}) => {
	let method = param.method || 'get'
	let headers = {
		'Cache-Control': 'no-cache',
		Pragma: 'no-cache'
	}

	if (method.toLowerCase() === 'get') {
		return fetch(url, {headers, credentials: 'include'}).catch(err => {
			console.warn(err)
		})
	} else {
		let payload = param.payload || ''
		let contentType = param.contentType || null
		if (!contentType) {
			let params = new FormData()
			for (let key in payload) {
				if (payload[key]) params.append(`${key}`, payload[key])
			}
			return fetch(url, {
				method: 'post',
				credentials: 'include',
				body: params
			})
		}
		payload = JSON.stringify(payload)
		return fetch(url, {
			method: method,
			headers: {
				'Content-Type': contentType
			},
			credentials: 'include',
			body: payload
		})
	}
}

const fetchProxy = async (url, param) => {
	try {
		const res = await doFetch(url, param)
		const data = await res.json()
		if (!res.ok) throw data.message
		return data
	} catch (e) {
		throw e.toString()
	}
}

export default fetchProxy
