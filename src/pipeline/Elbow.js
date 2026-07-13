/**
 * @file Elbow.js
 * @description 程序化 90° / 45° 弯头管道连接件，基于 TorusGeometry（圆环体）高精度生成，并自动计算法兰焊接定位面
 */

import * as THREE from 'three';
import { MaterialFactory } from '../material/MaterialFactory.js';

export class Elbow {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Elbow_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;
        this.angle = options.angle || 90; // 弯头角度：45 / 90 度
        this.medium = options.medium || 'gas';

        this.group = new THREE.Group();
        this._initElbow();
    }

    /**
     * 参数化弯头建模
     * @private
     */
    _initElbow() {
        const r = (this.dn / 2) / 1000; // 管道半径
        const R = r * 1.5; // 弯曲半径 (通常为 1.5D 标准弯头)

        const arcAngle = (this.angle / 180) * Math.PI;
        // TorusGeometry参数: 圆环半径(R), 管道半径(r), 径向分段, 管侧分段, 弧度角
        const geom = new THREE.TorusGeometry(R, r, 32, 32, arcAngle);

        let matName = 'pipe_yellow';
        if (this.medium === 'water') matName = 'pipe_green';
        if (this.medium === 'drain') matName = 'steel_structure';
        const material = MaterialFactory.getMaterial(matName);

        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Torus 默认生成在 XY 平面，且圆心位于 (0,0,0) 的右侧偏移 R 位置，需要调整中心锚点到起点。
        mesh.position.set(-R, 0, 0); 
        this.group.add(mesh);

        // 坐标姿态设置
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }
}
