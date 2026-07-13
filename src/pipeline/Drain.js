/**
 * @file Drain.js
 * @description 管道底部排污集液管件组件，程序化生成引出细管、截止阀、压力平衡管及法兰，用于放空积液以维持天然气管网干气工况
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Drain {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || 80; // 排污管多为 DN50 - DN100 细管
        this.direction = options.direction || new THREE.Vector3(0, -1, 0); // 默认垂直向下排污

        this.group = new THREE.Group();
        this._initDrain();
    }

    /**
     * 程序化构建底部排污装置
     * @private
     */
    _initDrain() {
        const pipeRadius = (this.dn / 2) / 1000;
        const length = 0.4; // 排放管伸出长度

        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 引出短接管 (Drain Nozzle)
        const nozzleGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, length, PIPELINE.SEGMENTS);
        const nozzleMesh = new THREE.Mesh(nozzleGeom, pipeMat);
        nozzleMesh.position.y = -length / 2;
        nozzleMesh.castShadow = true;
        this.group.add(nozzleMesh);

        // 2. 排污法兰 (Drain Connection Flange)
        const flange = new Flange(this.world, {
            position: new THREE.Vector3(0, -length, 0),
            dn: this.dn,
            direction: new THREE.Vector3(0, -1, 0)
        });

        // 整体定位姿态
        this.group.position.copy(this.position);
        
        const alignAxis = new THREE.Vector3(0, -1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, this.direction.clone().normalize());
        this.group.setRotationFromQuaternion(quaternion);

        this.scene.add(this.group);
    }
}
