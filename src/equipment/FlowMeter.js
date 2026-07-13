/**
 * @file FlowMeter.js
 * @description 流量计设备组件，程序化生成高精度高压孔板或超声波流量变送器筒体、带 LED 数码管的数据采集显示仪，支持流量值与累计工况数据数字孪生联动
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class FlowMeter {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Meter_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;
        this.flowValue = options.flowValue || 150000; // 瞬时流量标况值 (Nm³/h)
        this.totalValue = options.totalValue || 98765432; // 累计气量 (m³)

        this.group = new THREE.Group();
        this._initFlowMeter();
    }

    /**
     * 程序化参数建模高精度超声波流量计
     * @private
     */
    _initFlowMeter() {
        const pipeRadius = (this.dn / 2) / 1000;
        const meterLength = pipeRadius * 3.5;
        const bodyRadius = pipeRadius * 1.05;

        const meterMat = MaterialFactory.getMaterial('steel_structure');
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const bluePaint = MaterialFactory.getMaterial('pipe_yellow', { color: 0x0088ff }); // 变送器仪表表箱多用经典工业蓝色

        // 1. 流量计测量筒体 (Meter Body)
        const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, meterLength, 32);
        const bodyMesh = new THREE.Mesh(bodyGeom, meterMat);
        bodyMesh.rotation.z = Math.PI / 2; // 水平介质流
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 双侧标准法兰
        const flangeOffset = meterLength / 2 + 0.02;
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

        // 3. 超声波换能器探头 (Ultrasonic Transducers) - 四声道交叉布置
        const probeGeom = new THREE.CylinderGeometry(0.015, 0.015, 0.15, 8);
        for (let i = 0; i < 4; i++) {
            const probe = new THREE.Mesh(probeGeom, metalMat);
            probe.castShadow = true;
            // 交叉 45 度斜向插在计量筒体四角上
            probe.rotation.z = Math.PI / 4 * (i % 2 === 0 ? 1 : -1);
            probe.position.set(-meterLength * 0.2 + i * meterLength * 0.13, bodyRadius * 0.8, 0.04 * (i < 2 ? 1 : -1));
            this.group.add(probe);
        }

        // 4. 表头信号电缆接线盒 (Junction Box)
        const boxGeom = new THREE.BoxGeometry(0.12, 0.1, 0.1);
        const boxMesh = new THREE.Mesh(boxGeom, bluePaint);
        boxMesh.position.y = bodyRadius + 0.05;
        this.group.add(boxMesh);

        // 5. 支撑杆 (Stem)
        const stemGeom = new THREE.CylinderGeometry(0.01, 0.01, 0.12, 8);
        const stemMesh = new THREE.Mesh(stemGeom, metalMat);
        stemMesh.position.y = bodyRadius + 0.12;
        this.group.add(stemMesh);

        // 6. 数显液晶流量积分仪主机表头 (Display Head) - 典型立柱圆表盘
        const headRadius = 0.08;
        const headGeom = new THREE.CylinderGeometry(headRadius, headRadius, 0.08, 16);
        const headMesh = new THREE.Mesh(headGeom, bluePaint);
        headMesh.rotation.x = Math.PI / 2; // 表盘立在正面
        headMesh.position.set(0, bodyRadius + 0.22, bodyRadius * 0.2);
        headMesh.castShadow = true;
        this.group.add(headMesh);

        // 7. 发光数显屏幕 (LED Display Screen)
        const screenGeom = new THREE.PlaneGeometry(headRadius * 1.5, headRadius * 0.8);
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0x00ff66, // 亮绿色数码管背光
            side: THREE.DoubleSide
        });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.set(0, bodyRadius + 0.22, bodyRadius * 0.2 + 0.042);
        this.group.add(screenMesh);

        // 位置姿态设置
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：更新计量表数据并显示到关联传感器面板
     * @param {number} flow 
     * @param {number} total 
     */
    setValue(flow, total) {
        this.flowValue = flow;
        this.totalValue = total;
    }

    update() {
        // 用于屏幕状态微动闪烁、累计脉冲闪烁
    }
}
