/**
 * @file Pipe.js
 * @description 工业级直管段组件，负责根据起点、终点和公称直径（DN）程序化计算并生成高仿真黄色天然气管道，支持自适应流动动画 uniform 注入
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Pipe {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.from = options.from || new THREE.Vector3(0, 0, 0);
        this.to = options.to || new THREE.Vector3(10, 0, 0);
        this.dn = options.dn || PIPELINE.DEFAULT_DN; // 公称直径（单位：mm），如 300
        
        this.mesh = null;
        this._initPipe();
    }

    /**
     * 程序化构建直管段并计算其三维变换
     * @private
     */
    _initPipe() {
        const distance = this.from.distanceTo(this.to);
        if (distance < 0.001) return;

        // 根据公称直径 DN 计算外径（单位：米）
        const outerRadius = (this.dn / 2) / 1000;
        
        // 创建圆柱体几何，沿 Y 轴对称
        const geometry = new THREE.CylinderGeometry(outerRadius, outerRadius, distance, PIPELINE.SEGMENTS);
        const material = MaterialFactory.getMaterial('pipe_yellow');

        this.mesh = new THREE.Mesh(geometry, material);

        // 计算管线的中点位置
        const position = new THREE.Vector3().addVectors(this.from, this.to).multiplyScalar(0.5);
        this.mesh.position.copy(position);

        // 计算管线旋转：将默认的 Y 轴对齐旋转到 (to - from) 向量方向
        const direction = new THREE.Vector3().subVectors(this.to, this.from).normalize();
        const alignAxis = new THREE.Vector3(0, 1, 0); // 圆柱体默认朝向 Y 轴
        
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, direction);
        this.mesh.setRotationFromQuaternion(quaternion);

        // 管道接收与产生阴影
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);
    }

    /**
     * 获取直管段计算长度
     * @returns {number}
     */
    getLength() {
        return this.from.distanceTo(this.to);
    }
}
