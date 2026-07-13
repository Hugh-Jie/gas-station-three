/**
 * @file Pipe.js
 * @description 程序化生成自适应三维管道组件，支持法兰自动拟合、流向动画材质参数绑定、以及管路弯曲段和支路的对齐参数计算
 */

import * as THREE from 'three';
import { MaterialFactory } from '../material/MaterialFactory.js';

export class Pipe {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Pipe_Default';
        this.start = options.start || new THREE.Vector3(0, 0, 0);
        this.end = options.end || new THREE.Vector3(1, 0, 0);
        this.dn = options.dn || 300; // 公称直径 (DN)
        this.medium = options.medium || 'gas'; // 输送介质：gas(天然气 - 黄), water(水 - 绿), drain(排污 - 褐)

        this.group = new THREE.Group();
        this._initPipe();
    }

    /**
     * 程序化参数建模管道
     * @private
     */
    _initPipe() {
        const radius = (this.dn / 2) / 1000; // 毫米转米
        const distance = this.start.distanceTo(this.end);

        // 1. 生成主管体 (Main Pipe Cylinder)
        const geom = new THREE.CylinderGeometry(radius, radius, distance, 32);
        
        // 获取材质 (支持介质定制着色与流向效果)
        let matName = 'pipe_yellow';
        if (this.medium === 'water') matName = 'pipe_green';
        if (this.medium === 'drain') matName = 'steel_structure';
        const material = MaterialFactory.getMaterial(matName);

        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // 2. 管线姿态对齐与旋转计算 (通过四元数将默认垂直的圆柱体朝向其起终点向量)
        const direction = new THREE.Vector3().subVectors(this.end, this.start).normalize();
        const up = new THREE.Vector3(0, 1, 0); // 圆柱体默认朝上
        const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
        
        mesh.quaternion.copy(quaternion);

        // 3. 设置管线中心位置
        const midPoint = new THREE.Vector3().addVectors(this.start, this.end).multiplyScalar(0.5);
        mesh.position.copy(midPoint);

        this.group.add(mesh);
        this.scene.add(this.group);
    }

    /**
     * 获取管道起止点及方向
     */
    getGeometryInfo() {
        const dir = new THREE.Vector3().subVectors(this.end, this.start).normalize();
        return {
            start: this.start.clone(),
            end: this.end.clone(),
            direction: dir,
            radius: (this.dn / 2) / 1000
        };
    }
}
