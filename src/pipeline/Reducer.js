/**
 * @file Reducer.js
 * @description 渐缩管（异径管）组件，用于连接两条公称直径（DN）不同的同轴管道，程序化计算锥体过渡并生成高精度 PBR 网格
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Reducer {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dnLarge = options.dnLarge || PIPELINE.DEFAULT_DN;  // 大端直径（单位：mm）
        this.dnSmall = options.dnSmall || 150;                  // 小端直径（单位：mm）
        this.direction = options.direction || new THREE.Vector3(1, 0, 0); // 轴向
        this.length = options.length || 0.6;                    // 锥体过渡段长度（米）

        this.mesh = null;
        this._initReducer();
    }

    /**
     * 程序化构建同心异径管（锥体）
     * @private
     */
    _initReducer() {
        const radiusLarge = (this.dnLarge / 2) / 1000;
        const radiusSmall = (this.dnSmall / 2) / 1000;

        // 使用 CylinderGeometry 的两端不同半径，生成完美的锥管形
        const geometry = new THREE.CylinderGeometry(radiusSmall, radiusLarge, this.length, PIPELINE.SEGMENTS);
        const material = MaterialFactory.getMaterial('pipe_yellow');

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);

        // 旋转对齐：将默认朝 Y 轴的圆柱体旋转到 direction 方向
        const alignAxis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, this.direction.clone().normalize());
        this.mesh.setRotationFromQuaternion(quaternion);

        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);
    }
}
