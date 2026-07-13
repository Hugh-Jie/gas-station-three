/**
 * @file GateValve.js
 * @description 闸阀设备组件，程序化生成高仿真双向法兰闸阀、阀体箱、操作手轮，并提供提升/降低闸板的动画控制接口
 */

import * as THREE from 'three';
import { MaterialFactory } from '../material/MaterialFactory.js';
import { Flange } from '../pipeline/Flange.js';

export class GateValve {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'GateValve_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;
        this.status = options.status || 'closed'; // open / closed

        this.group = new THREE.Group();
        this.wheelMesh = null; // 顶部调节手轮
        this._initGateValve();
    }

    /**
     * 程序化参数建模高精度闸阀
     * @private
     */
    _initGateValve() {
        const pipeRadius = (this.dn / 2) / 1000;
        const bodyWidth = pipeRadius * 2.2;
        const bodyHeight = pipeRadius * 3.5;

        const valveMat = MaterialFactory.getMaterial('valve_red');
        const steelMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 阀体中段矩形闸板箱 (Gate Chamber)
        const chamberGeom = new THREE.BoxGeometry(bodyWidth, bodyHeight, bodyWidth);
        const chamberMesh = new THREE.Mesh(chamberGeom, valveMat);
        chamberMesh.position.y = bodyHeight / 2 - pipeRadius;
        chamberMesh.castShadow = true;
        chamberMesh.receiveShadow = true;
        this.group.add(chamberMesh);

        // 2. 阀门两侧法兰短接管
        const flangeOffset = bodyWidth / 2 + 0.05;
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

        // 3. 阀杆 (Stem)
        const stemHeight = bodyHeight * 0.8;
        const stemGeom = new THREE.CylinderGeometry(0.018, 0.018, stemHeight, 8);
        const stemMesh = new THREE.Mesh(stemGeom, steelMat);
        stemMesh.position.y = bodyHeight - pipeRadius + stemHeight / 2;
        stemMesh.castShadow = true;
        this.group.add(stemMesh);

        // 4. 旋转操作手轮 (Handwheel)
        const wheelOuterRadius = bodyWidth * 0.8;
        const wheelGeom = new THREE.TorusGeometry(wheelOuterRadius, 0.02, 8, 24);
        
        this.wheelMesh = new THREE.Mesh(wheelGeom, valveMat);
        this.wheelMesh.rotation.x = Math.PI / 2; // 水平手轮
        this.wheelMesh.position.y = bodyHeight - pipeRadius + stemHeight;
        this.wheelMesh.castShadow = true;
        this.group.add(this.wheelMesh);

        // 5. 手轮内支柱 (Spokes)
        const spokeGeom = new THREE.CylinderGeometry(0.01, 0.01, wheelOuterRadius * 2, 8);
        const spoke1 = new THREE.Mesh(spokeGeom, valveMat);
        spoke1.rotation.z = Math.PI / 2;
        spoke1.position.y = this.wheelMesh.position.y;
        this.group.add(spoke1);

        const spoke2 = spoke1.clone();
        spoke2.rotation.y = Math.PI / 2;
        this.group.add(spoke2);

        // 位置与姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定阀门开关状态并旋转手轮
     * @param {string} status 'open' 或 'closed'
     * @param {boolean} animate
     */
    setStatus(status, animate = true) {
        this.status = status;
        // 模拟真实旋转圈数
        const rotateAngle = status === 'open' ? Math.PI * 4 : 0;
        this.wheelMesh.rotation.z = rotateAngle;
    }

    update() {
        // 用于动画插值
    }
}
