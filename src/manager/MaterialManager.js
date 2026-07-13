/**
 * @file MaterialManager.js
 * @description 材质管理器，负责站内所有标准材质、发光/报警材质的运行时动态状态（颜色、粗糙度、贴图位移）调节
 */

import { MaterialFactory } from '@material/MaterialFactory.js';

export class MaterialManager {
    constructor(engine) {
        this.engine = engine;
        this.materials = {};
    }

    /**
     * 获取指定名称的 PBR 材质
     * @param {string} name 
     * @returns {THREE.Material}
     */
    getMaterial(name) {
        return MaterialFactory.getMaterial(name);
    }

    /**
     * 设置材质是否进入报警（红色呼吸闪烁）状态
     * @param {string} name 材质名称
     * @param {boolean} alarm 
     */
    setAlarmState(name, alarm) {
        const material = this.getMaterial(name);
        if (!material) return;

        if (alarm) {
            // 缓存原本的自发光颜色和强度
            material.userData.originalEmissive = material.emissive ? material.emissive.getHex() : 0x000000;
            material.userData.originalEmissiveIntensity = material.emissiveIntensity || 0;
            
            // 设定高亮红自发光
            if (material.emissive) {
                material.emissive.setHex(0xff0000);
                material.emissiveIntensity = 1.0;
            }
        } else {
            // 恢复原始色彩状态
            if (material.emissive && material.userData.originalEmissive !== undefined) {
                material.emissive.setHex(material.userData.originalEmissive);
                material.emissiveIntensity = material.userData.originalEmissiveIntensity;
            }
        }
    }
}
