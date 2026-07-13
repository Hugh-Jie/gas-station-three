/**
 * @file LabelManager.js
 * @description 3D 浮动标签（CSS2DRenderer）与 Tooltip 管理器，负责在设备与管道上方动态生成、悬浮、定位和销毁带有健康状态、报警参数的网页 HTML UI 标签
 */

import * as THREE from 'three';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { eventBus } from '@engine/EventBus.js';
import { EVENTS } from '@config/Constant.js';

export class LabelManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.container = engine.container;

        this.labelRenderer = null;
        this.labelsMap = new Map(); // 存储所有注册的 Object3D -> CSS2DObject 映射

        this._initLabelRenderer();
        this._listenEvents();
    }

    /**
     * 初始化 CSS2D 渲染器，使其完美叠合在 WebGL 渲染画布上方
     * @private
     */
    _initLabelRenderer() {
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0px';
        this.labelRenderer.domElement.style.pointerEvents = 'none'; // 穿透 DOM，确保 OrbitControls 与 SelectionManager 正常接收点击
        
        // 挂载到容器中
        this.container.appendChild(this.labelRenderer.domElement);
    }

    /**
     * 创建并在三维空间绑定一个 CSS2D 网页浮动 HTML 标签
     * @param {THREE.Object3D} object 绑定目标三维对象
     * @param {string} text 初始展示文字或数值
     * @param {string} className HTML CSS类名，自定义样式
     */
    createLabel(object, text, className = 'twin-label') {
        // 1. 创建原生 DOM 标签
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        
        // 应用高科技数字孪生扁平化科技蓝样式
        div.style.padding = '4px 10px';
        div.style.background = 'rgba(0, 20, 40, 0.85)';
        div.style.border = '1px solid #00ffcc';
        div.style.color = '#00ffcc';
        div.style.fontSize = '12px';
        div.style.fontFamily = 'monospace';
        div.style.borderRadius = '3px';
        div.style.whiteSpace = 'nowrap';
        div.style.transition = 'all 0.3s ease';

        // 2. 包装为 CSS2D 实体
        const labelObj = new CSS2DObject(div);
        
        // 向上偏移，保证标签悬浮于设备顶部而不是中心
        labelObj.position.set(0, 1.2, 0); 

        // 3. 建立层次绑定
        object.add(labelObj);
        this.labelsMap.set(object, labelObj);
    }

    /**
     * 孪生控制接口：动态刷新特定设备标签上的实时监控数值
     * @param {THREE.Object3D} object 
     * @param {string} text 新数值
     */
    updateLabelText(object, text) {
        const labelObj = this.labelsMap.get(object);
        if (labelObj && labelObj.element) {
            labelObj.element.textContent = text;
        }
    }

    /**
     * 销毁并移除特定对象上的 2D 浮动标签
     * @param {THREE.Object3D} object 
     */
    removeLabel(object) {
        const labelObj = this.labelsMap.get(object);
        if (labelObj) {
            object.remove(labelObj);
            this.labelsMap.delete(object);
        }
    }

    /**
     * 同步视口事件，在帧循环渲染时，必须同步触发 2D 渲染器的 render 调用
     * @private
     */
    _listenEvents() {
        eventBus.on(EVENTS.RENDER_TICK, () => {
            if (this.labelRenderer && this.scene && this.engine.getCamera()) {
                this.labelRenderer.render(this.scene, this.engine.getCamera());
            }
        });

        eventBus.on(EVENTS.RESIZE, (data) => {
            const { width, height } = data;
            if (this.labelRenderer) {
                this.labelRenderer.setSize(width, height);
            }
        });
    }
}
