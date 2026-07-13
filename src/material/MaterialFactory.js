/**
 * @file MaterialFactory.js
 * @description 材质工厂类，统一管理和生成场站所有的 PBR 材质（黄色管道、红色阀门、银色法兰、混凝土等），支持缓存复用
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';

export class MaterialFactory {
    static materials = {};

    /**
     * 获取或创建 PBR 材质
     * @param {string} name 材质名称标识
     * @param {Object} options 材质属性配置
     * @returns {THREE.Material}
     */
    static getMaterial(name, options = {}) {
        if (this.materials[name]) {
            return this.materials[name];
        }

        let material;

        switch (name) {
            case 'pipe_yellow':
                // 高仿真天然气管道黄色漆面 PBR 材质
                material = new THREE.MeshStandardMaterial({
                    color: PIPELINE.COLOR_GAS,
                    roughness: 0.25, // 具有中等轻微反光的烤漆面
                    metalness: 0.3,  // 漆面基底带有微弱金属质感
                    ...options
                });
                break;
            case 'valve_red':
                // 红色阀门，经典工业安全红
                material = new THREE.MeshStandardMaterial({
                    color: PIPELINE.COLOR_VALVE,
                    roughness: 0.3,
                    metalness: 0.2,
                    ...options
                });
                break;
            case 'flange_silver':
                // 银灰色不锈钢法兰、螺栓材质
                material = new THREE.MeshStandardMaterial({
                    color: PIPELINE.COLOR_FLANGE,
                    roughness: 0.15,
                    metalness: 0.95, // 强金属感
                    ...options
                });
                break;
            case 'concrete_base':
                // 设备支撑混凝土地面基础
                material = new THREE.MeshStandardMaterial({
                    color: 0x888888,
                    roughness: 0.9,
                    metalness: 0.05,
                    ...options
                });
                break;
            case 'steel_structure':
                // 钢架结构及过桥、踏板
                material = new THREE.MeshStandardMaterial({
                    color: 0x4a4a4a,
                    roughness: 0.4,
                    metalness: 0.8,
                    ...options
                });
                break;
            default:
                material = new THREE.MeshStandardMaterial({
                    color: 0xffffff,
                    ...options
                });
        }

        this.materials[name] = material;
        return material;
    }
}
