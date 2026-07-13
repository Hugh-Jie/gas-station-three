/**
 * @file SceneManager.js
 * @description 场景管理器，管理 Three.js 场景对象及层级结构
 */

import * as THREE from 'three';

export class SceneManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = new THREE.Scene();
        
        this._initScene();
    }

    /**
     * 初始化场景配置
     * @private
     */
    _initScene() {
        this.scene.background = new THREE.Color(0x1a1a1a);
        // 开启雾效，增加工业园区远景空间感
        this.scene.fog = new THREE.FogExp2(0x1a1a1a, 0.005);
    }

    /**
     * 获取 Three.js 场景实例
     * @returns {THREE.Scene}
     */
    getScene() {
        return this.scene;
    }

    /**
     * 清理场景
     */
    clear() {
        while(this.scene.children.length > 0){ 
            const object = this.scene.children[0];
            this.scene.remove(object);
        }
    }
}
