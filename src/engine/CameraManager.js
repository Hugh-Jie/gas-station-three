/**
 * @file CameraManager.js
 * @description 相机管理器，负责透视相机的初始化、极限裁剪面及主相机机位配置
 */

import * as THREE from 'three';
import { ENGINE_CONFIG } from '@config/Constant.js';

export class CameraManager {
    constructor(engine) {
        this.engine = engine;
        this.container = engine.container;
        this.camera = null;

        this._initCamera();
    }

    /**
     * 初始化工业级大场景透视相机
     * @private
     */
    _initCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        
        this.camera = new THREE.PerspectiveCamera(
            ENGINE_CONFIG.FOV,
            aspect,
            ENGINE_CONFIG.NEAR,
            ENGINE_CONFIG.FAR
        );

        // 设置默认工业鸟瞰视角机位
        this.camera.position.set(
            ENGINE_CONFIG.CAMERA_POS[0],
            ENGINE_CONFIG.CAMERA_POS[1],
            ENGINE_CONFIG.CAMERA_POS[2]
        );
    }

    /**
     * 获取 Camera 实例
     * @returns {THREE.PerspectiveCamera}
     */
    getCamera() {
        return this.camera;
    }

    /**
     * 响应视口大小调整
     * @param {number} width 
     * @param {number} height 
     */
    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
    }
}
