/**
 * @file Tee.js
 * @description 三通管件组件，负责程序化生成 T 型分叉接头，实现主管路与支管路的垂直或成角分流合流连接
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Tee {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || PIPELINE.DEFAULT_DN;
        this.directionMain = options.directionMain || new THREE.Vector3(1, 0, 0); // 主管朝向
        this.directionBranch = options.directionBranch || new THREE.Vector3(0, 0, 1); // 支管朝向

        this.group = new THREE.Group();
        this._initTee();
    }

    /**
     * 程序化构建三通交叉管道结构
     * @private
     */
    _initTee() {
        const pipeRadius = (this.dn / 2) / 1000;
        const mainLength = pipeRadius * 4.0;   // 主管长度
        const branchLength = pipeRadius * 2.5; // 支管伸出长度

        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');

        // 1. 创建主管网格 (Main Cylinder)
        const mainGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, mainLength, PIPELINE.SEGMENTS);
        const mainMesh = new THREE.Mesh(mainGeom, pipeMat);
        mainMesh.rotation.z = Math.PI / 2; // 默认平躺在 X 轴上
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        this.group.add(mainMesh);

        // 2. 创建支管网格 (Branch Cylinder)
        const branchGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, branchLength, PIPELINE.SEGMENTS);
        const branchMesh = new THREE.Mesh(branchGeom, pipeMat);
        // 移动支管，使其底端紧贴主管外壁
        branchMesh.position.y = branchLength / 2;
        
        // 支管独立子容器，便于相对主管旋转
        const branchContainer = new THREE.Group();
        branchContainer.add(branchMesh);
        // 默认主管在 X，支管朝向 Y
        this.group.add(branchContainer);

        // 3. 应用外部方向矩阵与旋转对齐
        this.group.position.copy(this.position);

        // 计算主管朝向旋转（从默认 X 轴旋转到 directionMain 方向）
        const alignAxis = new THREE.Vector3(1, 0, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, this.directionMain.clone().normalize());
        this.group.setRotationFromQuaternion(quaternion);

        // 根据支管方向，调整支管支路的偏角
        const localBranchDir = this.directionBranch.clone().applyQuaternion(quaternion.clone().invert()).normalize();
        const branchAngle = Math.atan2(localBranchDir.z, localBranchDir.y);
        branchContainer.rotation.x = branchAngle;

        this.scene.add(this.group);
    }
}
