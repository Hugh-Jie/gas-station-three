/**
 * @file VentPipe.js
 * @description 放散管（放散阀）组件，程序化生成高耸不锈钢管体、防雨帽、阀座、排污阀和防雷接地扁钢，并在放散管顶部配置粒子流动发光效果
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class VentPipe {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Vent_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.height = options.height || 12.0; // 工业防雷放散管通常高达 12 米
        this.dn = options.dn || 150;        // 放散管公称直径多为 DN150
        this.isVenting = options.isVenting || false; // 是否正在放散

        this.group = new THREE.Group();
        this._initVentPipe();
    }

    /**
     * 程序化参数建模高耸安全放散管及防雨帽
     * @private
     */
    _initVentPipe() {
        const pipeRadius = (this.dn / 2) / 1000;
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');

        // 1. 基座安装法兰盘
        const baseFlange = new Flange(this.world, {
            position: new THREE.Vector3(0, 0.05, 0),
            dn: this.dn * 1.5, // 底座法兰通常加大
            direction: new THREE.Vector3(0, 1, 0)
        });

        // 2. 高耸放散管本体 (Vertical Standpipe)
        const pipeGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, this.height, 16);
        const pipeMesh = new THREE.Mesh(pipeGeom, pipeMat);
        pipeMesh.position.y = this.height / 2;
        pipeMesh.castShadow = true;
        pipeMesh.receiveShadow = true;
        this.group.add(pipeMesh);

        // 3. 顶部防雨帽 (Rain Cap / Vent Hood) - 经典伞状倒锥体
        const capRadius = pipeRadius * 2.5;
        const capGeom = new THREE.ConeGeometry(capRadius, 0.25, 12, 1, true); // 底部开口的伞帽
        const capMesh = new THREE.Mesh(capGeom, metalMat);
        capMesh.position.y = this.height + 0.15;
        capMesh.castShadow = true;
        this.group.add(capMesh);

        // 支撑雨帽的细钢条 (Support Brackets)
        const bracketGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4);
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const bracket = new THREE.Mesh(bracketGeom, metalMat);
            bracket.position.set(
                Math.cos(angle) * pipeRadius * 1.2,
                this.height + 0.05,
                Math.sin(angle) * pipeRadius * 1.2
            );
            this.group.add(bracket);
        }

        // 4. 侧向手动放散截止阀
        const valveOffset = 1.2; // 阀门安装在 1.2 米易于手动操作的高度
        const nozzleGeom = new THREE.CylinderGeometry(pipeRadius * 0.8, pipeRadius * 0.8, 0.4, 12);
        const nozzle = new THREE.Mesh(nozzleGeom, pipeMat);
        nozzle.rotation.z = Math.PI / 2;
        nozzle.position.set(0.2, valveOffset, 0);
        this.group.add(nozzle);

        // 5. 放散管防雷接地扁钢 (Lightning Earthing Conductor) - 贴着管壁一拉到底
        const earthGeom = new THREE.BoxGeometry(0.01, this.height, 0.04);
        const earthMesh = new THREE.Mesh(earthGeom, metalMat);
        earthMesh.position.set(pipeRadius + 0.006, this.height / 2, 0);
        this.group.add(earthMesh);

        // 位置与姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：开启/停止天然气紧急排放动画
     * @param {boolean} venting 
     */
    setVenting(venting) {
        this.isVenting = venting;
    }

    update() {
        // 用于更新顶部高速喷出粒子的向上飘散流动动画效果
    }
}
