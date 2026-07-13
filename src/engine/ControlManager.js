/**
 * @file ControlManager.js
 * @description 控制器管理器，封装 OrbitControls，并对工业级数字孪生视角的旋转、缩放、平移进行区间约束
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ENGINE_CONFIG } from '@config/Constant.js';

export class ControlManager {
    constructor(engine) {
        this.engine = engine;
        this.camera = engine.getCamera();
        this.renderer = engine.getRenderer();
        this.controls = null;

        this._initControls();
    }

    /**
     * 初始化并约束轨道控制器
     * @private
     */
    _initControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        
        // 开启阻尼物理惯性，提升画面过渡平滑度
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // 视口距离与缩放范围约束，防止穿透地面或缩放过大
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;

        // 垂直旋转角度约束（仰角限制），不允许翻转到地平线以下
        this.controls.minPolarAngle = 0.05; 
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // 接近 90 度

        // 设置聚焦中心
        this.controls.target.set(
            ENGINE_CONFIG.TARGET_POS[0],
            ENGINE_CONFIG.TARGET_POS[1],
            ENGINE_CONFIG.TARGET_POS[2]
        );
        this.controls.update();
    }

    /**
     * 更新控制器状态，需在每帧渲染循环中调用
     * @param {number} delta 
     */
    update(delta) {
        if (this.controls) {
            this.controls.update();
        }
    }

    /**
     * 获取控制器实例
     * @returns {OrbitControls}
     */
    getControls() {
        return this.controls;
    }
}
