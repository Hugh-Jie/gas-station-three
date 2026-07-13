/**
 * @file Base.js
 * @description 基础支撑墩组件，用于管道支架落地部分的混凝土二次浇筑底座，提供重力基础与防震定位
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Base {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.width = options.width || 0.6;
        this.height = options.height || 0.3;
        this.depth = options.depth || 0.6;

        this.mesh = null;
        this._initBase();
    }

    /**
     * 程序化构建混凝土定位墩
     * @private
     */
    _initBase() {
        const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const material = MaterialFactory.getMaterial('concrete_base');

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += this.height / 2; // 贴地

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);
    }
}
