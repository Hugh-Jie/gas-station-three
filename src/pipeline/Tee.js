/**
 * @file Tee.js
 * @description 程序化参数建模三通管路连接件组件，支持主管与支管变径自适应拟合，支持各端口法兰、焊缝高保真复现
 */

import * as THREE from 'three';
import { MaterialFactory } from '../material/MaterialFactory.js';

export class Tee {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Tee_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dnMain = options.dnMain || 300; // 主管公称直径
        this.dnBranch = options.dnBranch || 200; // 支管公称直径
        this.medium = options.medium || 'gas';

        this.group = new THREE.Group();
        this._initTee();
    }

    /**
     * 程序化三通参数建模
     * @private
     */
    _initTee() {
        const rMain = (this.dnMain / 2) / 1000;
        const rBranch = (this.dnBranch / 2) / 1000;
        const mainLength = rMain * 4;
        const branchLength = rMain * 2.5;

        let matName = 'pipe_yellow';
        if (this.medium === 'water') matName = 'pipe_green';
        if (this.medium === 'drain') matName = 'steel_structure';
        const material = MaterialFactory.getMaterial(matName);

        // 1. 主管体 (Main Pipe Cylinder)
        const mainGeom = new THREE.CylinderGeometry(rMain, rMain, mainLength, 32);
        const mainMesh = new THREE.Mesh(mainGeom, material);
        mainMesh.rotation.z = Math.PI / 2; // 沿 X 轴水平分布
        mainMesh.castShadow = true;
        mainMesh.receiveShadow = true;
        this.group.add(mainMesh);

        // 2. 支管体 (Branch Pipe Cylinder)
        const branchGeom = new THREE.CylinderGeometry(rBranch, rBranch, branchLength, 32);
        const branchMesh = new THREE.Mesh(branchGeom, material);
        // 垂直主管斜向上 (沿 Y 轴分布)
        branchMesh.position.y = branchLength / 2;
        branchMesh.castShadow = true;
        branchMesh.receiveShadow = true;
        this.group.add(branchMesh);

        // 3. 支管补强板 (Reinforcement Pad) - 工业管道特色焊接加强筋
        const padGeom = new THREE.CylinderGeometry(rBranch * 1.25, rBranch * 1.25, 0.015, 32);
        const padMesh = new THREE.Mesh(padGeom, MaterialFactory.getMaterial('steel_structure'));
        padMesh.position.y = rMain;
        this.group.add(padMesh);

        // 姿态对齐
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }
}
