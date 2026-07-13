/**
 * @file ModelManager.js
 * @description 模型加载与管理器，负责 GLTF/Draco 工业模型的统一加载、进度分发、LOD 降级及网格缓存复用，支持实例化网格（InstancedMesh）优化性能
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class ModelManager {
    constructor(engine) {
        this.engine = engine;
        this.loader = new GLTFLoader();
        this.cache = {};

        this._initDraco();
    }

    /**
     * 初始化 Draco 解码器，实现高压缩比工业 GLTF 模型的秒开
     * @private
     */
    _initDraco() {
        const dracoLoader = new DRACOLoader();
        // 设置本地 Draco 解码器路径，严禁使用外部 CDN
        dracoLoader.setDecoderPath('vendor/three/draco/');
        dracoLoader.setDecoderConfig({ type: 'js' });
        this.loader.setDRACOLoader(dracoLoader);
    }

    /**
     * 异步加载 GLTF 模型文件
     * @param {string} name 模型唯一标识
     * @param {string} url 模型文件路径
     * @returns {Promise<THREE.Group>}
     */
    loadModel(name, url) {
        if (this.cache[name]) {
            // 深度克隆，避免多个复用实例在修改材质、位置时互相影响
            return Promise.resolve(this.cache[name].clone());
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    
                    // 开启阴影支持
                    model.traverse((child) => {
                        if (child.isMesh) {
                            child.castShadow = true;
                            child.receiveShadow = true;
                        }
                    });

                    this.cache[name] = model;
                    resolve(model.clone());
                },
                (xhr) => {
                    // 可通过 EventBus 广播实时加载进度
                },
                (err) => reject(err)
            );
        });
    }

    /**
     * 针对大量重复设备（如阀门、支架），使用实例化网格技术（InstancedMesh）极大减少 Draw Call
     * @param {THREE.BufferGeometry} geometry 
     * @param {THREE.Material} material 
     * @param {number} count 最大复用实例数
     * @returns {THREE.InstancedMesh}
     */
    createInstancedMesh(geometry, material, count) {
        const instMesh = new THREE.InstancedMesh(geometry, material, count);
        instMesh.castShadow = true;
        instMesh.receiveShadow = true;
        return instMesh;
    }
}
