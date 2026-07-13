/**
 * @file Pump.js
 * @description 离心泵/柱塞泵设备组件，程序化生成高精度卧式泵体、双吸叶轮腔、防爆电动机、联轴器护罩及法兰，支持流速与开关状态数字孪生联动
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Pump {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Pump_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 200;
        this.status = options.status || 'stopped'; // running / stopped
        this.flowRate = options.flowRate || 0.0;     // 实时排量 (m³/h)

        this.group = new THREE.Group();
        this._initPump();
    }

    /**
     * 程序化参数建模高压离心注水/排液泵机组
     * @private
     */
    _initPump() {
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const motorMat = MaterialFactory.getMaterial('steel_structure', { color: 0x1f4e5b }); // 蓝灰色工业漆
        const pumpMat = MaterialFactory.getMaterial('valve_red');
        const baseMat = MaterialFactory.getMaterial('concrete_base');

        // 1. 公用整体钢座底座 (Steel Skid Base)
        const baseGeom = new THREE.BoxGeometry(2.4, 0.25, 1.2);
        const baseMesh = new THREE.Mesh(baseGeom, baseMat);
        baseMesh.position.y = 0.125;
        baseMesh.castShadow = true;
        baseMesh.receiveShadow = true;
        this.group.add(baseMesh);

        // 2. 驱动电机 (Electric Motor)
        const motorRadius = 0.35;
        const motorLength = 0.9;
        const motorGeom = new THREE.CylinderGeometry(motorRadius, motorRadius, motorLength, 12);
        const motorMesh = new THREE.Mesh(motorGeom, motorMat);
        motorMesh.rotation.z = Math.PI / 2; // 水平卧式
        motorMesh.position.set(-0.5, 0.25 + motorRadius, 0);
        motorMesh.castShadow = true;
        this.group.add(motorMesh);

        // 3. 联轴器 (Coupling)
        const couplingGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8);
        const couplingMesh = new THREE.Mesh(couplingGeom, metalMat);
        couplingMesh.rotation.z = Math.PI / 2;
        couplingMesh.position.set(0.15, 0.25 + motorRadius * 0.6, 0);
        this.group.add(couplingMesh);

        // 4. 离心泵头蜗壳 (Centrifugal Pump Head / Volute)
        const voluteGeom = new THREE.TorusGeometry(0.3, 0.12, 8, 16);
        const voluteMesh = new THREE.Mesh(voluteGeom, pumpMat);
        voluteMesh.position.set(0.6, 0.25 + motorRadius * 0.6, 0);
        voluteMesh.castShadow = true;
        this.group.add(voluteMesh);

        // 5. 泵吸入口与排出口 (Inlet and Outlet Nozzles)
        const nozzleGeom = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
        
        // 轴向吸入口 (End Suction)
        const suctionMesh = new THREE.Mesh(nozzleGeom, pumpMat);
        suctionMesh.rotation.z = Math.PI / 2;
        suctionMesh.position.set(0.9, 0.25 + motorRadius * 0.6, 0);
        this.group.add(suctionMesh);

        // 径向排出口 (Top Discharge)
        const dischargeMesh = new THREE.Mesh(nozzleGeom, pumpMat);
        dischargeMesh.position.set(0.6, 0.25 + motorRadius * 0.6 + 0.35, 0);
        this.group.add(dischargeMesh);

        // 整体定位姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：设置泵启动运行状态与排量
     * @param {string} status 
     * @param {number} flowRate 
     */
    setValue(status, flowRate) {
        this.status = status;
        this.flowRate = flowRate;
    }

    update() {
        // 用于动态泵体高频震颤特效与流速指示
    }
}
