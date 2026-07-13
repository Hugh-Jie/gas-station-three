/**
 * @file Grass.js
 * @description 工业园区绿化隔离带组件，采用精细的草坪 PBR 材质，排布在站区非道路与设备硬化区域，增加园区景观真实度
 */

import * as THREE from 'three';

export class Grass {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.width = options.width || 40;
        this.depth = options.depth || 30;

        this.mesh = null;
        this._initGrass();
    }

    /**
     * 程序化生成绿色草坪区域
     * @private
     */
    _initGrass() {
        const geometry = new THREE.PlaneGeometry(this.width, this.depth);
        
        // 绿化带草坪 PBR 材质
        const material = new THREE.MeshStandardMaterial({
            color: 0x3b5f1f,          // 真实草坪深墨绿色
            roughness: 0.9,           // 极高粗糙度，无反光
            metalness: 0.05
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.copy(this.position);
        this.mesh.position.y = 0.015; // 略高于道路和路缘，防止 Z-Fighting
        
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);
    }
}
