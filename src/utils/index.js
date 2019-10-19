export const MODEL_TYPE_FILE_MAP = {
	obj: [
		{
			id: 'obj',
			label: 'OBJ 文件',
			key: 'objFile',
			rules: [{required: true, message: 'OBJ 文件不能为空'}],
			required: true,
			message: '请选择 OBJ 文件'
		},
		{
			id: 'mtl',
			label: 'MTL 文件',
			key: 'mtlFile',
			rules: []
		}
	],
	stl: [
		{
			id: 'stl',
			label: 'STL 文件',
			key: 'stlFile',
			rules: [{required: true, message: 'STL 文件不能为空'}],
			required: true,
			message: '请选择 STL 文件'
		}
	],
	fbx: [
		{
			id: 'fbx',
			label: 'FBX 文件',
			key: 'fbxFile',
			rules: [{required: true, message: 'FBX 文件不能为空'}],
			required: true,
			message: '请选择 FBX 文件'
		}
	]
}

export const delay = timeout =>
	new Promise(res => {
		setTimeout(res, timeout)
	})

export const defaultCenter = [116.4035, 39.915]
