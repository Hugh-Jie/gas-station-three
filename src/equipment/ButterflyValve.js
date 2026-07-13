/**
 * @file ButterflyValve.js
 * @description 蝶阀设备组件，程序化建模生成超薄阀体、流线型蝶板、阀轴、带刻度对齐的操纵手柄，支持蝶板旋转与孪生开度状态更新
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class ButterflyValve {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Butterfly_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;
        this.status = options.status || 'closed'; // open / closed

        this.group = new THREE.Group();
        this.discMesh = null; // 蝶阀内旋转蝶板（阀板）
        this.handleMesh = null; // 操作手柄
        this._initButterflyValve();
    }

    /**
     * 程序化参数建模高精度蝶阀
     * @private
     */
    _initButterflyValve() {
        const pipeRadius = (this.dn / 2) / 1000;
        const bodyThickness = pipeRadius * 0.4; // 蝶阀结构长度极短（对夹式/法兰式蝶阀非常薄）
        const bodyRadius = pipeRadius * 1.3;

        const valveMat = MaterialFactory.getMaterial('valve_red');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 超薄环状阀体 (Thin Ring Body)
        const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyThickness, PIPELINE.SEGMENTS);
        const bodyMesh = new THREE.Mesh(bodyGeom, valveMat);
        bodyMesh.rotation.z = Math.PI / 2; // 水平介质流向
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 双侧紧凑法兰端面
        const leftFlange = new Flange(this.world, {
            position: new THREE.Vector3(-bodyThickness / 2, 0, 0),
            dn: this.dn,
            direction: new THREE.Vector3(-1, 0, 0)
        });
        const rightFlange = new Flange(this.world, {
            position: new THREE.Vector3(bodyThickness / 2, 0, 0),
            dn: this.dn,
            direction: new THREE.Vector3(1, 0, 0)
        });

        // 3. 旋转蝶板 (Rotating Disc) - 阀体内部的核心圆形隔绝板
        const discGeom = new THREE.CylinderGeometry(pipeRadius * 0.95, pipeRadius * 0.95, 0.02, PIPELINE.SEGMENTS);
        this.discMesh = new THREE.Mesh(discGeom, metalMat);
        this.discMesh.castShadow = true;

        // 蝶板中心轴（垂直方向），将其放入旋转容器
        this.discContainer = new THREE.Group();
        // 默认圆柱体沿 Y 轴对称，旋转至平行于管道截面（YZ平面）
        this.discMesh.rotation.z = Math.PI / 2;
        this.discContainer.add(this.discMesh);
        this.group.add(this.discContainer);

        // 4. 阀轴与调节手柄 (Stem and Handle)
        const stemHeight = bodyRadius * 1.1;
        const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, stemHeight, 8);
        const stemMesh = new THREE.Mesh(stemGeom, metalMat);
        stemMesh.position.y = stemHeight / 2;
        this.group.add(stemMesh);

        const handleLength = bodyRadius * 3.0;
        const handleGeom = new THREE.BoxGeometry(handleLength, 0.03, 0.06);
        this.handleMesh = new THREE.Mesh(handleGeom, valveMat);
        this.handleMesh.position.set(handleLength / 2 - 0.04, stemHeight, 0);
        this.handleMesh.castShadow = true;

        this.handleContainer = new THREE.Group();
        this.handleContainer.add(this.handleMesh);
        this.group.add(this.handleContainer);

        // 初始化开关姿态
        this.setStatus(this.status, false);

        // 5. 应用位置与姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定开关状态
     * @param {string} status 
     * @param {boolean} animate 
     */
    setStatus(status, animate = true) {
        this.status = status;
        const targetAngle = status === 'open' ? Math.PI / 2 : 0; // 开：蝶板平行于流向，手柄垂直；闭：蝶板垂直隔断，手柄平行。

        this.discContainer.rotation.y = targetAngle;
        this.handleContainer.rotation.y = targetAngle;
    }

    update() {
        // 用于数据更新
    }
}
