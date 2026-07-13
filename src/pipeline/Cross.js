/**
 * @file Cross.js
 * @description 十字四通管件组件，负责程序化生成四向交叉法兰接口，实现管道在水平或垂直两个正交方向的十字连通
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Cross {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || PIPELINE.DEFAULT_DN;
        this.directionX = options.directionX || new THREE.Vector3(1, 0, 0); // 主正交轴 X 方向
        this.directionZ = options.directionZ || new THREE.Vector3(0, 0, 1); // 辅正交轴 Z 方向

        this.group = new THREE.Group();
        this._initCross();
    }

    /**
     * 程序化构建四通正交管道结构
     * @private
     */
    _initCross() {
        const pipeRadius = (this.dn / 2) / 1000;
        const length = pipeRadius * 4.0; // 主支路对称半长

        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');

        // 1. 创建 X 轴向直管 (X Axis Cylinder)
        const xGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, PIPELINE.SEGMENTS);
        const xMesh = new THREE.Mesh(xGeom, pipeMat);
        xMesh.rotation.z = Math.PI / 2; // 旋转到 X 轴
        xMesh.castShadow = true;
        xMesh.receiveShadow = true;
        this.group.add(xMesh);

        // 2. 创建 Z 轴向直管 (Z Axis Cylinder)
        const zGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, PIPELINE.SEGMENTS);
        const zMesh = new THREE.Mesh(zGeom, pipeMat);
        zMesh.rotation.x = Math.PI / 2; // 旋转到 Z 轴
        zMesh.castShadow = true;
        zMesh.receiveShadow = true;
        this.group.add(zMesh);

        // 3. 应用外部方向矩阵与旋转对齐
        this.group.position.copy(this.position);

        // 通过叉乘建立变换四元数，将默认的 Y-UP 和 X-RIGHT 变换至 directionX 和 directionZ 指向的局部空间
        const up = new THREE.Vector3(0, 1, 0);
        const normal = new THREE.Vector3().crossVectors(this.directionX, this.directionZ).normalize();
        
        if (normal.lengthSq() > 0.001) {
            const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            this.group.setRotationFromQuaternion(q);
        }

        this.scene.add(this.group);
    }
}
