/**
 * @file Vent.js
 * @description 管道顶部高位安全放散阀管件组件，程序化生成高位引出细管、截止隔离阀、安全防雨帽及法兰，用于异常超压时安全排放燃气
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Vent {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || 80; // 高位放散细管多为 DN50 - DN80
        this.direction = options.direction || new THREE.Vector3(0, 1, 0); // 默认垂直向上放散

        this.group = new THREE.Group();
        this._initVent();
    }

    /**
     * 程序化构建高位放散阀
     * @private
     */
    _initVent() {
        const pipeRadius = (this.dn / 2) / 1000;
        const length = 0.5; // 垂直段长度

        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 垂直引出短管 (Vent Nozzle)
        const nozzleGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, PIPELINE.SEGMENTS);
        const nozzleMesh = new THREE.Mesh(nozzleGeom, pipeMat);
        nozzleMesh.position.y = length / 2;
        nozzleMesh.castShadow = true;
        this.group.add(nozzleMesh);

        // 2. 顶端法兰接口 (Vent Flange)
        const flange = new Flange(this.world, {
            position: new THREE.Vector3(0, length, 0),
            dn: this.dn,
            direction: new THREE.Vector3(0, 1, 0)
        });

        // 3. 简易防雨伞帽 (Simple Rain Hood)
        const capRadius = pipeRadius * 2.0;
        const capGeom = new THREE.ConeGeometry(capRadius, 0.1, 12);
        const capMesh = new THREE.Mesh(capGeom, metalMat);
        capMesh.position.y = length + 0.15;
        this.group.add(capMesh);

        // 整体定位姿态
        this.group.position.copy(this.position);

        const alignAxis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, this.direction.clone().normalize());
        this.group.setRotationFromQuaternion(quaternion);

        this.scene.add(this.group);
    }
}
