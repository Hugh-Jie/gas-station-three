/**
 * @file CheckValve.js
 * @description 旋启式单向阀（止回阀）组件，根据公称直径（DN）程序化生成阀体、阀盖、单向介质流向箭头标志，并配置法兰物理连接接口
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class CheckValve {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'CheckValve_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;

        this.group = new THREE.Group();
        this._initCheckValve();
    }

    /**
     * 程序化参数建模高精度单向止回阀
     * @private
     */
    _initCheckValve() {
        const pipeRadius = (this.dn / 2) / 1000;
        const bodyLength = pipeRadius * 3.0;
        const bodyRadius = pipeRadius * 1.35;

        const valveMat = MaterialFactory.getMaterial('valve_red');
        const steelMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 阀体主筒 (Main Body Cylinder) - 旋启阀常呈流线型隆起筒体
        const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 16);
        const bodyMesh = new THREE.Mesh(bodyGeom, valveMat);
        bodyMesh.rotation.z = Math.PI / 2; // 水平卧式
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 阀盖 (Bonnet) - 位于顶部的凸起检修盖
        const bonnetHeight = bodyRadius * 0.5;
        const bonnetGeom = new THREE.CylinderGeometry(bodyRadius * 0.8, bodyRadius * 0.8, bonnetHeight, 12);
        const bonnetMesh = new THREE.Mesh(bonnetGeom, valveMat);
        bonnetMesh.position.y = bodyRadius * 0.7;
        bonnetMesh.castShadow = true;
        this.group.add(bonnetMesh);

        // 3. 阀盖法兰片及栓紧结构
        const bonnetFlangeGeom = new THREE.CylinderGeometry(bodyRadius * 0.9, bodyRadius * 0.9, 0.03, 12);
        const bonnetFlangeMesh = new THREE.Mesh(bonnetFlangeGeom, steelMat);
        bonnetFlangeMesh.position.y = bodyRadius * 0.7 + bonnetHeight / 2;
        this.group.add(bonnetFlangeMesh);

        // 4. 双侧法兰连接接口
        const flangeOffset = bodyLength / 2 + 0.02;
        const leftFlange = new Flange(this.world, {
            position: new THREE.Vector3(-flangeOffset, 0, 0),
            dn: this.dn,
            direction: new THREE.Vector3(-1, 0, 0)
        });
        const rightFlange = new Flange(this.world, {
            position: new THREE.Vector3(flangeOffset, 0, 0),
            dn: this.dn,
            direction: new THREE.Vector3(1, 0, 0)
        });

        // 5. 铸造流向箭头 (Direction Arrow) - 强制单向阀物理流向可视化
        const arrowGroup = new THREE.Group();
        const arrowShaftGeom = new THREE.BoxGeometry(bodyLength * 0.4, 0.015, 0.03);
        const arrowShaft = new THREE.Mesh(arrowShaftGeom, steelMat);
        arrowGroup.add(arrowShaft);

        const arrowHeadGeom = new THREE.ConeGeometry(0.05, 0.1, 4);
        const arrowHead = new THREE.Mesh(arrowHeadGeom, steelMat);
        arrowHead.rotation.z = -Math.PI / 2; // 指向 X 正方向
        arrowHead.position.x = bodyLength * 0.2 + 0.05;
        arrowGroup.add(arrowHead);

        // 将箭头贴在阀体正面外壳
        arrowGroup.position.set(0, 0, bodyRadius + 0.01);
        this.group.add(arrowGroup);

        // 位置与姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    update() {
        // 止回阀内部拍板微动物理模拟
    }
}
