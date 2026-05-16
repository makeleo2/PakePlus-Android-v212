window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
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

// 重写 window.open 方法，在新窗口中打开链接时置顶
window.open = function (url, target, features) {
    console.log('open', url, target, features)
    
    // 如果提供了 features 参数，添加置顶标志
    if (features) {
        // 确保包含 always-on-top 或 topmost 标志
        if (typeof features === 'string') {
            if (!features.includes('always-on-top') && !features.includes('topmost')) {
                features += ',always-on-top'
            }
        }
    } else {
        // 如果没有提供 features，创建一个包含置顶标志的 features
        features = 'always-on-top'
    }
    
    console.log('modified features:', features)
    
    // 调用原始的 open 方法（如果可用）或者直接跳转
    try {
        return window.originalOpen ? window.originalOpen(url, target, features) : (location.href = url)
    } catch (e) {
        location.href = url
    }
}

// 保存原始的 open 方法（如果存在）
if (!window.originalOpen) {
    window.originalOpen = window.open
}

// 窗口置顶功能
const makeWindowAlwaysOnTop = () => {
    // 尝试使用各种方法设置窗口置顶
    try {
        // 方法1: 尝试调用可能的桌面应用API
        if (window.pake && typeof window.pake.setAlwaysOnTop === 'function') {
            window.pake.setAlwaysOnTop(true)
            console.log('Window set to always on top via pake API')
        }
        
        // 方法2: 尝试调用可能的electron API
        if (window.electron && typeof window.electron.setAlwaysOnTop === 'function') {
            window.electron.setAlwaysOnTop(true)
            console.log('Window set to always on top via electron API')
        }
        
        // 方法3: 尝试调用可能的tauri API
        if (window.__TAURI__ && window.__TAURI__.window) {
            window.__TAURI__.window.setAlwaysOnTop(true)
            console.log('Window set to always on top via tauri API')
        }
        
        // 方法4: 发送自定义事件（某些打包工具可能会监听）
        const event = new CustomEvent('setWindowAlwaysOnTop', { detail: true })
        window.dispatchEvent(event)
        
    } catch (error) {
        console.log('Could not set window always on top:', error)
    }
}

// 页面加载完成后尝试设置窗口置顶
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', makeWindowAlwaysOnTop)
} else {
    makeWindowAlwaysOnTop()
}

// 添加点击事件监听
document.addEventListener('click', hookClick, { capture: true })

// 可选：添加一个全局函数来切换置顶状态
window.toggleAlwaysOnTop = function(enable = true) {
    try {
        if (window.pake && typeof window.pake.setAlwaysOnTop === 'function') {
            window.pake.setAlwaysOnTop(enable)
        } else if (window.electron && typeof window.electron.setAlwaysOnTop === 'function') {
            window.electron.setAlwaysOnTop(enable)
        } else if (window.__TAURI__ && window.__TAURI__.window) {
            window.__TAURI__.window.setAlwaysOnTop(enable)
        }
        console.log(`Window always on top ${enable ? 'enabled' : 'disabled'}`)
    } catch (error) {
        console.log('Could not toggle always on top:', error)
    }
}
window.toggleAlwaysOnTop (true);