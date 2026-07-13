/**
 * @file Flange.js
 * @description 程序化高精度法兰与螺栓孔紧固件组件，支持法兰厚度、密封水线、以及法兰螺栓孔分布的参数化建模
 */

import * as THREE from 'three';
import { MaterialFactory } from '../material/MaterialFactory.js';

export class Flange {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Flange_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || 300;
        this.direction = options.direction || new THREE.Vector3(0, 1, 0); // 法兰朝向向量

        this.group = new THREE.Group();
        this._initFlange();
    }

    /**
     * 程序化参数建模法兰
     * @private
     */
    _initFlange() {
        const pipeRadius = (this.dn / 2) / 1000;
        const flangeRadius = pipeRadius * 1.35; // 法兰盘外径
        const flangeThickness = 0.025 + (this.dn / 10000); // 按压力等级及口径比例调整法兰厚度

        const flangeMat = MaterialFactory.getMaterial('flange_silver');
        const boltMat = MaterialFactory.getMaterial('steel_structure');

        // 1. 法兰盘本体 (Flange Disk)
        const discGeom = new THREE.CylinderGeometry(flangeRadius, flangeRadius, flangeThickness, 32);
        const discMesh = new THREE.Mesh(discGeom, flangeMat);
        discMesh.rotation.x = Math.PI / 2; // 圆柱默认垂直，转为法向朝 z 轴
        discMesh.castShadow = true;
        discMesh.receiveShadow = true;
        this.group.add(discMesh);

        // 2. 参数化环向均匀布置紧固螺栓 (Circularly Patterned Bolts)
        const boltCount = this.dn >= 300 ? 16 : 8; // 大口径管道采用 16 颗高强螺栓
        const pcd = (pipeRadius + flangeRadius) / 2; // 螺栓中心圆孔径 (PCD)
        const boltRadius = 0.008 + (this.dn / 40000);
        const boltLength = flangeThickness * 1.5;

        const boltGeom = new THREE.CylinderGeometry(boltRadius, boltRadius, boltLength, 8);

        for (let i = 0; i < boltCount; i++) {
            const angle = (i / boltCount) * Math.PI * 2;
            const bolt = new THREE.Mesh(boltGeom, boltMat);
            bolt.castShadow = true;
            
            // 环向排布位置
            bolt.position.set(Math.cos(angle) * pcd, Math.sin(angle) * pcd, 0);
            bolt.rotation.x = Math.PI / 2; // 垂直穿过法兰盘
            this.group.add(bolt);
        }

        // 3. 姿态与朝向对齐 (将法兰盘法向对准 options.direction 向量)
        this.group.position.copy(this.position);
        
        const defaultNormal = new THREE.Vector3(0, 0, 1);
        const targetNormal = this.direction.clone().normalize();
        const quaternion = new THREE.Quaternion().setFromUnitVectors(defaultNormal, targetNormal);
        this.group.quaternion.copy(quaternion);

        this.scene.add(this.group);
    }
}
