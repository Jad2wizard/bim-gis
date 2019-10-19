const fs = require('fs')
const path = require('path')
const moment = require('moment')
const {rmdirSync} = require('jadwizard-lib')

const modelTempStoreRoot = path.resolve(__dirname, './../../res/data/models')

const dumpModelData = (modelPath, id) => {
	const res = {}
	if (!fs.existsSync(modelPath)) throw new Error('模型不存在')
	const metadataPath = path.resolve(modelPath, 'metadata.json')
	if (!fs.existsSync(metadataPath)) throw new Error('模型信息文件不存在')
	const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'))
	for (let k in metadata) res[k] = metadata[k]
	return res
}

const getModel = async ctx => {
	try {
		const res = []
		const id = ctx.params.id
		if (id) {
			const modelPath = path.resolve(modelTempStoreRoot, id)
			res.push(dumpModelData(modelPath, id))
		} else {
			for (let dir of fs.readdirSync(modelTempStoreRoot)) {
				if (dir.startsWith('.')) continue
				const modelPath = path.resolve(modelTempStoreRoot, dir)
				res.push(dumpModelData(modelPath, dir))
			}
		}
		res.sort((a, b) => (a.updateTime > b.updateTime ? -1 : 1))
		ctx.body = {
			message: '成功获取模型',
			data: res
		}
	} catch (e) {
		ctx.response.body = {message: e.toString()}
		ctx.status = 400
	}
}

const addModel = async ctx => {
	try {
		const files = ctx.request.files
		const {name, type, desc, lat, lng} = ctx.request.body
		if (!name) throw new Error('缺少模型名称')
		if (!type) throw new Error('缺少模型类型')

		const json = {}
		json.id = moment().valueOf() + '_' + ((Math.random() * 1000) | 0)

		const modelPath = path.resolve(modelTempStoreRoot, json.id)
		if (fs.existsSync(modelPath)) throw new Error('模型已存在')
		fs.mkdirSync(modelPath)

		json.name = name
		json.type = type
		json.desc = desc || ''
		json.lng = lng
		json.lat = lat
		json.createTime = moment().valueOf()
		json.updateTime = moment().valueOf()
		if (files) {
			for (let filename in files) {
				const file = files[filename]

				const writeFilePath = path.resolve(modelPath, file.name)

				const reader = fs.createReadStream(file.path)
				const writer = fs.createWriteStream(writeFilePath)
				reader.pipe(writer)

				json[filename] = `/data/models/${json.id}/${file.name}`
			}
		}

		fs.writeFileSync(
			path.resolve(modelPath, 'metadata.json'),
			JSON.stringify(json)
		)

		const newModel = dumpModelData(
			path.resolve(modelTempStoreRoot, json.id),
			json.id
		)
		ctx.body = {
			message: '上传成功',
			data: newModel
		}
	} catch (e) {
		ctx.response.body = {message: e.toString()}
		ctx.status = 400
	}
}

const delModel = async ctx => {
	try {
		const id = ctx.params.id
		if (!id) throw new Error('模型 id 缺失')

		const modelPath = path.resolve(modelTempStoreRoot, id)
		if (!fs.existsSync(modelPath)) throw new Error('模型不存在')

		rmdirSync(modelPath)
		ctx.body = {
			message: '删除模型成功'
		}
	} catch (e) {
		ctx.response.body = {message: e.toString()}
		ctx.status = 400
	}
}

const updateModel = async ctx => {
	try {
		const id = ctx.params.id
		const params = ctx.request.body
		if (!id) throw new Error('模型 id 缺失')
		const metadataFilePath = path.resolve(
			modelTempStoreRoot,
			id,
			'metadata.json'
		)
		if (!fs.existsSync(metadataFilePath))
			throw new Error('模型的 metadata 数据不存在')

		const metadata = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'))
		for (let key in params) {
			metadata[key] = params[key]
		}
		metadata.updateTime = moment().valueOf()
		fs.writeFileSync(metadataFilePath, JSON.stringify(metadata))

		ctx.body = {
			message: '修改模型成功',
			data: metadata
		}
	} catch (e) {
		ctx.response.body = {message: e.toString()}
		ctx.status = 400
	}
}

module.exports = {
	getModel,
	addModel,
	delModel,
	updateModel
}
