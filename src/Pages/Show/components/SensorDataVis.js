import React, {useMemo, useEffect, useState} from 'react'
import {Modal, message} from 'antd'
import moment from 'moment'
import ReactEchartsCore from 'echarts-for-react/lib/core'
import echarts from 'echarts/lib/echarts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/dataZoom'
import 'echarts/lib/component/grid'
import {URL_MAP} from './../../../utils'
import styles from './SensorDataVis.less'
import {func} from 'prop-types'

const Chart = React.memo(({xData, data, unit}) => {
    const option = useMemo(() => {
        return {
            tooltip: {
                trigger: 'axis',
                position: pt => [pt[0], '5%'],
                formatter: params => {
                    const param = params[0]
                    return `${param.axisValue}<br/>${param.seriesName}: ${param.data}${unit}`
                }
            },
            grid: {
                top: 40,
                left: 75,
                right: 10,
                bottom: 40
            },
            dataZoom: [
                {
                    type: 'inside',
                    xAxisIndex: [0]
                },
                {
                    type: 'slider',
                    xAxisIndex: [0],
                    top: 5,
                    height: 20
                }
            ],
            xAxis: {
                type: 'category',
                splitLine: {
                    show: false
                },
                data: xData
            },
            yAxis: {
                type: 'value',
                min: value =>
                    (value.min - (value.max - value.min) * 0.1).toFixed(3),
                max: value =>
                    (value.max + (value.max - value.min) * 0.1).toFixed(3),
                splitLine: {
                    show: false
                }
            },
            series: [
                {
                    name: '数据',
                    type: 'line',
                    hoverAnimation: false,
                    sampling: 'average',
                    smooth: true,
                    itemStyle: {
                        color: 'rgb(255, 70, 131)'
                    },
                    data
                }
            ]
        }
    }, [data, xData, unit])

    return <ReactEchartsCore echarts={echarts} option={option} />
})

const SensorDataVis = React.memo(({modelid, sensor, onCancel}) => {
    const [data, setData] = useState({xData: [], data: [], unit: ''})

    useEffect(() => {
        const func = () => {
            fetch(URL_MAP.fetchSensorDataUrl(modelid, 100, sensor.deviceCode))
                .then(res => res.json())
                .then(data => {
                    if (data.result && data.result.length > 0) {
                        setData({
                            xData: data.result.map(i =>
                                moment(i[0])
                                    .format('YYYY/MM/DD HH:mm:ss')
                                    .replace(' ', '\n')
                            ),
                            data: data.result.map(i => Number(i[1])),
                            unit: data.result[0][2]
                        })
                    }
                })
                .catch(e => {
                    message.error(e)
                })
        }

        func()

        const id = setInterval(func, 5000)

        return () => {
            clearInterval(id)
        }
    }, [sensor.deviceCode, modelid])

    return (
        <Modal
            title={`${sensor.type}-${sensor.deviceCode}`}
            visible={true}
            width={700}
            footer={null}
            wrapClassName={styles.container}
            onCancel={onCancel}>
            <Chart {...data} />
        </Modal>
    )
})

export default SensorDataVis
