/**
 * @file Elbow.js
 * @description 弯头管件组件，负责程序化计算和生成 90 度/45 度弯头，使相邻直管段在三维空间中平滑转折过渡
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Elbow {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || PIPELINE.DEFAULT_DN;
        this.angle = options.angle || 90; // 弯头角度，默认 90 度
        this.radius = options.radius || ((options.dn || PIPELINE.DEFAULT_DN) * 1.5) / 1000; // 弯曲半径，默认 1.5D

        this.directionIn = options.directionIn || new THREE.Vector3(1, 0, 0);
        this.directionOut = options.directionOut || new THREE.Vector3(0, 1, 0);

        this.mesh = null;
        this._initElbow();
    }

    /**
     * 程序化构建圆弧弯头网格
     * @private
     */
    _initElbow() {
        const pipeRadius = (this.dn / 2) / 1000;
        
        // 使用三维圆环几何体 (TorusGeometry) 创建弯头
        // radialSegments 对应圆管截面细分数，tubularSegments 对应圆弧长度方向细分数
        const arc = (this.angle / 180) * Math.PI;
        const geometry = new THREE.TorusGeometry(this.radius, pipeRadius, PIPELINE.SEGMENTS, 32, arc);
        const material = MaterialFactory.getMaterial('pipe_yellow');

        this.mesh = new THREE.Mesh(geometry, material);

        // 创建独立容器，实现精确的弯头对齐与旋转
        this.group = new THREE.Group();
        this.group.position.copy(this.position);

        // 默认 Torus 在 XY 平面，圆心在原点，圆弧从 0 弧度开始。
        // 将 Torus 的起点移到原点
        this.mesh.position.set(0, -this.radius, 0);
        this.group.add(this.mesh);

        // 根据入射、出射方向计算弯头的旋转，确保两端精准对接
        // 此处建立从默认姿态到所需姿态的四元数变换
        const normal = new THREE.Vector3().crossVectors(this.directionIn, this.directionOut).normalize();
        if (normal.lengthSq() > 0.001) {
            const up = new THREE.Vector3(0, 0, 1);
            const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
            this.group.setRotationFromQuaternion(q);
        }

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.scene.add(this.group);
    }
}
