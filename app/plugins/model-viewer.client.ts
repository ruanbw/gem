/**
 * 注册 model-viewer 自定义元素
 * 必须在客户端导入 @google/model-viewer 才能正确渲染 3D 模型并触发 load 事件
 */
import '@google/model-viewer'

export default defineNuxtPlugin(() => {
  // 同步 import 已在模块加载时执行，custom element 已注册
})
