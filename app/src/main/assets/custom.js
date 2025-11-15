// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

window.open = function (url, target, features) {
    console.log('open', url, target, features)
    location.href = url
}

// PakePlus 相机功能支持
// 确保原有网站的相机功能在打包的应用中正常工作
const initCameraSupport = () => {
    // 检查是否在 PakePlus 环境中
    const isPakePlus = typeof window.__PAKE__ !== 'undefined' || 
                       navigator.userAgent.includes('Pake') ||
                       navigator.userAgent.includes('Electron')
    
    if (!isPakePlus) {
        console.log('非 PakePlus 环境，跳过相机支持初始化')
        return
    }
    
    console.log('PakePlus 环境检测到，初始化相机支持')
    
    // 保存原始的 getUserMedia 方法
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices)
    
    // 确保 mediaDevices 存在
    if (!navigator.mediaDevices) {
        navigator.mediaDevices = {}
    }
    
    // 重写 getUserMedia 以处理权限问题
    if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = async (constraints) => {
            try {
                console.log('PakePlus: 请求相机权限', constraints)
                const stream = await originalGetUserMedia(constraints)
                console.log('PakePlus: 相机权限获取成功')
                return stream
            } catch (error) {
                console.error('PakePlus: 相机权限获取失败:', error)
                
                // 在 PakePlus 环境中提供更详细的错误信息
                if (error.name === 'NotAllowedError') {
                    throw new Error('请在系统设置中允许应用访问相机，然后重启应用')
                } else if (error.name === 'NotFoundError') {
                    throw new Error('未找到可用的相机设备，请检查相机连接')
                } else if (error.name === 'NotSupportedError') {
                    throw new Error('当前设备不支持相机功能')
                } else {
                    throw new Error(`相机访问失败: ${error.message}`)
                }
            }
        }
    }
    
    // 确保其他媒体设备方法也存在
    if (!navigator.mediaDevices.enumerateDevices && originalGetUserMedia) {
        navigator.mediaDevices.enumerateDevices = async () => {
            console.log('PakePlus: 模拟枚举设备')
            // 返回模拟的设备列表
            return [
                {
                    deviceId: 'default',
                    kind: 'videoinput',
                    label: '相机',
                    groupId: 'default'
                }
            ]
        }
    }
}

// 页面加载完成后初始化相机支持
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCameraSupport)
} else {
    initCameraSupport()
}

// 为网站提供相机功能检测支持
const checkCameraSupport = () => {
    return new Promise((resolve) => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            resolve({
                supported: false,
                message: '浏览器不支持相机功能'
            })
            return
        }
        
        // 检查相机权限状态
        navigator.mediaDevices.enumerateDevices()
            .then(devices => {
                const videoDevices = devices.filter(device => device.kind === 'videoinput')
                const hasCamera = videoDevices.length > 0
                
                resolve({
                    supported: true,
                    hasCamera: hasCamera,
                    cameraCount: videoDevices.length,
                    cameras: videoDevices
                })
            })
            .catch(error => {
                resolve({
                    supported: false,
                    message: `检测相机设备失败: ${error.message}`
                })
            })
    })
}

// 导出全局函数供网站使用
window.PakePlus = {
    // 检测相机支持
    checkCameraSupport,
    
    // 请求相机权限的便捷方法
    requestCamera: async (options = {}) => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('当前环境不支持相机功能')
            }
            
            const constraints = {
                video: {
                    facingMode: options.facingMode || 'environment',
                    width: options.width || { ideal: 1280 },
                    height: options.height || { ideal: 720 }
                },
                audio: false
            }
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints)
            return stream
        } catch (error) {
            console.error('PakePlus 相机请求失败:', error)
            throw error
        }
    },
    
    // 安全地关闭相机流
    stopCamera: (stream) => {
        if (stream && typeof stream.getTracks === 'function') {
            stream.getTracks().forEach(track => {
                track.stop()
            })
            console.log('PakePlus: 相机流已安全关闭')
        }
    }
}

console.log('PakePlus 相机支持脚本已加载')

document.addEventListener('click', hookClick, { capture: true })