/**
 * @file TextureManager.js
 * @description 纹理管理器，负责集中异步加载并缓存场站所需的高精 PBR 贴图（金属拉丝、混凝土缝、沥青道路、防滑网格等），提供高空、地面贴图平铺矩阵计算
 */

import * as THREE from 'three';

export class TextureManager {
    constructor(engine) {
        this.engine = engine;
        this.loader = new THREE.TextureLoader();
        this.cache = {};
    }

    /**
     * 异步加载指定纹理贴图，并对其进行 PBR 包裹参数调优
     * @param {string} name 纹理唯一标识名
     * @param {string} url 贴图文件路径或数据URI
     * @param {Object} options 贴图平铺/环绕配置项
     * @returns {Promise<THREE.Texture>}
     */
    loadTexture(name, url, options = {}) {
        if (this.cache[name]) {
            return Promise.resolve(this.cache[name]);
        }

        return new Promise((resolve, reject) => {
            this.loader.load(
                url,
                (texture) => {
                    // 1. 默认应用 PBR 环绕重复规范
                    texture.wrapS = options.wrapS || THREE.RepeatWrapping;
                    texture.wrapT = options.wrapT || THREE.RepeatWrapping;
                    
                    if (options.repeat) {
                        texture.repeat.set(options.repeat[0], options.repeat[1]);
                    }

                    // 2. 自动根据贴图类型匹配色彩空间
                    if (options.isSRGB) {
                        texture.colorSpace = THREE.SRGBColorSpace; // 标准 sRGB 色彩
                    }

                    // 3. 开启各向异性过滤，避免远景地物及细长管道贴图模糊和摩尔纹
                    const maxAnisotropy = this.engine.getRenderer().capabilities.getMaxAnisotropy();
                    texture.anisotropy = Math.min(options.anisotropy || 8, maxAnisotropy);

                    this.cache[name] = texture;
                    resolve(texture);
                },
                undefined,
                (err) => reject(err)
            );
        });
    }

    /**
     * 同步获取已加载完毕的缓存纹理
     * @param {string} name 
     * @returns {THREE.Texture|null}
     */
    getTexture(name) {
        return this.cache[name] || null;
    }
}
