/**
 * @file Regulator.js
 * @description 调压器设备组件，程序化建模生成调压阀体、双膜头执行机构、平衡反馈导压管、前后压力表取压口及安全切断保护装置
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Regulator {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Regulator_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 200; // 调压支路多为 DN200 或 DN150
        this.inletPressure = options.inletPressure || 4.0; // 进口压力 (MPa)
        this.outletPressure = options.outletPressure || 0.4; // 出口压力 (MPa)

        this.group = new THREE.Group();
        this._initRegulator();
    }

    /**
     * 程序化参数建模自力式燃气调压阀
     * @private
     */
    _initRegulator() {
        const pipeRadius = (this.dn / 2) / 1000;
        const bodyLength = pipeRadius * 3.2;
        const bodyRadius = pipeRadius * 1.3;

        const bodyMat = MaterialFactory.getMaterial('valve_red');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 调压阀阀体 (Valve Body)
        const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 16);
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.rotation.z = Math.PI / 2; // 水平介质流
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 双侧法兰连接接口
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

        // 3. 下部阀执行杆 (Lower Stem)
        const stemHeight = bodyRadius * 1.5;
        const stemGeom = new THREE.CylinderGeometry(0.015, 0.015, stemHeight, 8);
        const stemMesh = new THREE.Mesh(stemGeom, metalMat);
        stemMesh.position.y = bodyRadius + stemHeight / 2;
        stemMesh.castShadow = true;
        this.group.add(stemMesh);

        // 4. 大型气动薄膜执行机构（膜头 / Actuator Chamber）- 燃气调压站最醒目的飞碟状结构
        const diaphragmRadius = bodyRadius * 2.8;
        const diaphragmHeight = bodyRadius * 0.9;
        
        const actuatorGeom = new THREE.CylinderGeometry(diaphragmRadius, diaphragmRadius, diaphragmHeight, 24);
        const actuatorMesh = new THREE.Mesh(actuatorGeom, bodyMat);
        actuatorMesh.position.y = bodyRadius + stemHeight + diaphragmHeight / 2;
        actuatorMesh.castShadow = true;
        this.group.add(actuatorMesh);

        // 5. 膜头中部夹紧加强圆法兰边
        const ringGeom = new THREE.CylinderGeometry(diaphragmRadius * 1.05, diaphragmRadius * 1.05, 0.04, 24);
        const ringMesh = new THREE.Mesh(ringGeom, metalMat);
        ringMesh.position.y = bodyRadius + stemHeight + diaphragmHeight / 2;
        this.group.add(ringMesh);

        // 6. 顶部负载调节弹簧罩筒 (Spring Cap)
        const capHeight = stemHeight * 1.2;
        const capGeom = new THREE.CylinderGeometry(diaphragmRadius * 0.25, diaphragmRadius * 0.3, capHeight, 12);
        const capMesh = new THREE.Mesh(capGeom, metalMat);
        capMesh.position.y = bodyRadius + stemHeight + diaphragmHeight + capHeight / 2;
        capMesh.castShadow = true;
        this.group.add(capMesh);

        // 7. 反馈导压细管路 (Feedback Sensing Line) - 连通阀后管道与膜头
        const path = new THREE.CatmullRomCurve3([
            new THREE.Vector3(bodyLength * 0.6, 0, 0),                       // 阀后侧壁起
            new THREE.Vector3(bodyLength * 0.6, -pipeRadius * 1.8, 0),
            new THREE.Vector3(0, -pipeRadius * 1.8, diaphragmRadius * 0.8),
            new THREE.Vector3(0, bodyRadius + stemHeight, diaphragmRadius * 0.8),
            new THREE.Vector3(0, bodyRadius + stemHeight, 0)                 // 接回执行膜头
        ]);
        const tubeGeom = new THREE.TubeGeometry(path, 20, 0.008, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeom, metalMat);
        this.group.add(tubeMesh);

        // 位置姿态设置
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：更新阀前、阀后实时调压数据
     * @param {number} inlet 
     * @param {number} outlet 
     */
    setValue(inlet, outlet) {
        this.inletPressure = inlet;
        this.outletPressure = outlet;
    }

    update() {
        // 用于动态微振幅膜片物理弹性特效动画
    }
}
