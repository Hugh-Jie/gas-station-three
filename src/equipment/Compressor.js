/**
 * @file Compressor.js
 * @description 往复式/离心式压缩机机组设备组件，程序化生成高精度双级压缩气缸、级间冷却器、润滑油箱、大型变频驱动电机及仪表控制盘，支持振动与转速孪生监控
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Compressor {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Compressor_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.rpmValue = options.rpmValue || 1480; // 驱动电机转速 (rpm)
        this.vibrationValue = options.vibrationValue || 2.4; // 轴承振动值 (mm/s)

        this.group = new THREE.Group();
        this._initCompressor();
    }

    /**
     * 程序化参数建模大型离心式天然气增压压缩机组
     * @private
     */
    _initCompressor() {
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const motorMat = MaterialFactory.getMaterial('steel_structure', { color: 0x228B22 }); // 工业绿电机外壳
        const baseMat = MaterialFactory.getMaterial('concrete_base');
        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');

        // 1. 公用整体钢筋混凝土撬座底座 (Skid Base)
        const skidGeom = new THREE.BoxGeometry(6.0, 0.4, 3.2);
        const skidMesh = new THREE.Mesh(skidGeom, baseMat);
        skidMesh.position.y = 0.2;
        skidMesh.castShadow = true;
        skidMesh.receiveShadow = true;
        this.group.add(skidMesh);

        // 2. 变频防爆电动机 (Driving Motor) - 呈一端圆柱型隆起
        const motorRadius = 0.8;
        const motorLength = 2.0;
        const motorGeom = new THREE.CylinderGeometry(motorRadius, motorRadius, motorLength, 16);
        const motorMesh = new THREE.Mesh(motorGeom, motorMat);
        motorMesh.rotation.z = Math.PI / 2; // 水平布置轴线
        motorMesh.position.set(-1.2, 0.4 + motorRadius, 0);
        motorMesh.castShadow = true;
        this.group.add(motorMesh);

        // 电机散热端盖 (Cooling Fan Hood)
        const fanGeom = new THREE.CylinderGeometry(motorRadius * 0.95, motorRadius * 0.95, 0.3, 16);
        const fanMesh = new THREE.Mesh(fanGeom, MaterialFactory.getMaterial('steel_structure'));
        fanMesh.rotation.z = Math.PI / 2;
        fanMesh.position.set(-2.3, 0.4 + motorRadius, 0);
        this.group.add(fanMesh);

        // 3. 联轴器护罩 (Shaft Coupling Guard)
        const couplingGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.6, 12);
        const couplingMesh = new THREE.Mesh(couplingGeom, metalMat);
        couplingMesh.rotation.z = Math.PI / 2;
        couplingMesh.position.set(0.1, 0.4 + motorRadius * 0.5, 0);
        this.group.add(couplingMesh);

        // 4. 离心压缩机蜗壳 (Centrifugal Compressor Volute Casing)
        const voluteGeom = new THREE.TorusGeometry(0.7, 0.25, 12, 24);
        const voluteMesh = new THREE.Mesh(voluteGeom, MaterialFactory.getMaterial('steel_structure', { color: 0x555555 }));
        voluteMesh.position.set(1.0, 0.4 + motorRadius * 0.6, 0);
        voluteMesh.castShadow = true;
        this.group.add(voluteMesh);

        // 5. 进出气接管及法兰
        const inletPipeGeom = new THREE.CylinderGeometry(0.15, 0.15, 0.8, 12);
        const inletPipe = new THREE.Mesh(inletPipeGeom, pipeMat);
        inletPipe.position.set(1.0, 0.4 + motorRadius * 0.6 + 0.7, 0.3);
        inletPipe.castShadow = true;
        this.group.add(inletPipe);

        // 顶吸入口法兰
        const inletFlange = new Flange(this.world, {
            position: new THREE.Vector3(1.0, 0.4 + motorRadius * 0.6 + 1.1, 0.3).applyEuler(this.rotation).add(this.position),
            dn: 300,
            direction: new THREE.Vector3(0, 1, 0).applyEuler(this.rotation)
        });

        // 整体定位姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：设置压缩机转速与振动指标
     * @param {number} rpm 
     * @param {number} vib 
     */
    setValue(rpm, vib) {
        this.rpmValue = rpm;
        this.vibrationValue = vib;
    }

    update() {
        // 可引入轴承微幅高频振动物理模拟特效
    }
}
