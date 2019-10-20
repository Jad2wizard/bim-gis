import * as THREE from 'three'

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
		},
		{
			id: 'zip',
			label: '贴图压缩文件',
			key: 'zipFile',
			rules: [],
			tip:
				'解压缩后的贴图文件或贴图文件夹将与mtl文件放在同一目录中，请注意贴图文件与mtl文件的相对位置'
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

export const defaultModelImg = '/img/timg.c98df3e.jpg'

export const SENSOR_LIST = [
	{
		id: 'thermometer',
		name: '温度计',
		mesh: new THREE.Mesh(
			new THREE.BoxGeometry(1, 1, 1),
			new THREE.MeshPhongMaterial({color: '#a85251'})
		)
	},
	{
		id: 'hygrometer',
		name: '湿度计',
		mesh: new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 32, 32),
			new THREE.MeshPhongMaterial({color: '#328792'})
		)
	}
]
