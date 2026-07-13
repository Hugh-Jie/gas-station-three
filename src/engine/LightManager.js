/**
 * @file LightManager.js
 * @description 光照管理器，配置符合数字孪生环境要求的太阳平行光、环境光、半球光，并精确调优阴影图（Shadow Map）
 */

import * as THREE from 'three';

export class LightManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();

        this.ambientLight = null;
        this.dirLight = null;
        this.hemiLight = null;

        this._initLights();
    }

    /**
     * 初始化高保真场景光照与阴影系统
     * @private
     */
    _initLights() {
        // 1. 半球光（HemisphereLight）：模拟天空到地面的漫反射光过渡
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
        this.hemiLight.position.set(0, 200, 0);
        this.scene.add(this.hemiLight);

        // 2. 环境光（AmbientLight）：提供场景暗部基础照度，防止出现纯黑死角
        this.ambientLight = new THREE.AmbientLight(0x333333, 0.5);
        this.scene.add(this.ambientLight);

        // 3. 平行光（DirectionalLight）：模拟太阳光，产生清晰真实的工业设备阴影
        this.dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.dirLight.position.set(100, 150, 50);
        
        // 阴影渲染细节配置
        this.dirLight.castShadow = true;
        this.dirLight.shadow.camera.top = 120;
        this.dirLight.shadow.camera.bottom = -120;
        this.dirLight.shadow.camera.left = -150;
        this.dirLight.shadow.camera.right = 150;
        this.dirLight.shadow.camera.near = 0.1;
        this.dirLight.shadow.camera.far = 500;
        
        // 提高阴影贴图分辨率，确保细长管道阴影不锯齿
        this.dirLight.shadow.mapSize.width = 2048;
        this.dirLight.shadow.mapSize.height = 2048;
        this.dirLight.shadow.bias = -0.0005;

        this.scene.add(this.dirLight);
    }

    /**
     * 更新光照方向（用于模拟昼夜交替等数字孪生特性）
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    updateSunPosition(x, y, z) {
        if (this.dirLight) {
            this.dirLight.position.set(x, y, z);
        }
    }
}
