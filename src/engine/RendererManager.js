/**
 * @file RendererManager.js
 * @description 渲染器管理器，负责 WebGL 渲染器初始化、性能参数配置及后期处理链设置
 */

import * as THREE from 'three';

export class RendererManager {
    constructor(engine) {
        this.engine = engine;
        this.container = engine.container;
        this.renderer = null;

        this._initRenderer();
    }

    /**
     * 初始化渲染器并配置工业级画质参数
     * @private
     */
    _initRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,              // 开启抗锯齿
            alpha: false,                 // 不透明背景
            powerPreference: "high-performance", // 强制启用高性能GPU
            logarithmicDepthBuffer: true  // 解决大规模三维场景深度冲突（Z-Fighting）
        });

        // 设定物理正确的光照与色调映射
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 柔和阴影
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // 电影级色调映射
        this.renderer.toneMappingExposure = 1.0;
        
        // 设定分辨率及挂载
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        
        this.container.appendChild(this.renderer.domElement);
    }

    /**
     * 获取 WebGLRenderer 实例
     * @returns {THREE.WebGLRenderer}
     */
    getRenderer() {
        return this.renderer;
    }

    /**
     * 执行渲染
     * @param {THREE.Scene} scene 
     * @param {THREE.Camera} camera 
     */
    render(scene, camera) {
        this.renderer.render(scene, camera);
    }

    /**
     * 响应窗口尺寸变化
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        this.renderer.setSize(width, height);
    }
}
