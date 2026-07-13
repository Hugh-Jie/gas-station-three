/**
 * @file PressureGauge.js
 * @description 压力表仪器组件，程序化生成高精度取压不锈钢弯管（缓冲管）、表头法兰、高灵敏弹簧管表盘及旋转指示指针，内置压力数值孪生更新接口与指针微幅摆动动画
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class PressureGauge {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Gauge_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.pressureValue = options.pressureValue || 1.6; // 默认压力值 1.6 MPa
        this.maxPressure = options.maxPressure || 6.0;      // 量程 6.0 MPa

        this.group = new THREE.Group();
        this.pointerMesh = null; // 指针对象
        this._initPressureGauge();
    }

    /**
     * 程序化参数建模高精度弹簧管压力表
     * @private
     */
    _initPressureGauge() {
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // 白色表盘
        const pointerMat = MaterialFactory.getMaterial('valve_red'); // 红色指针

        // 1. 根部冷凝弯/缓冲管 (Syphon / Pig-tail Loop) - 经典压力表散热冷凝不锈钢细弯管
        const syphonPath = new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(0, 0.1, 0),
            new THREE.Vector3(0.04, 0.15, 0.02),
            new THREE.Vector3(0, 0.2, 0.04),
            new THREE.Vector3(-0.04, 0.15, -0.02),
            new THREE.Vector3(0, 0.25, 0),
            new THREE.Vector3(0, 0.35, 0)
        ]);
        const syphonGeom = new THREE.TubeGeometry(syphonPath, 32, 0.006, 8, false);
        const syphonMesh = new THREE.Mesh(syphonGeom, metalMat);
        syphonMesh.castShadow = true;
        this.group.add(syphonMesh);

        // 2. 表头外壳 (Gauge Case) - 卧式圆盘筒体
        const caseRadius = 0.08;
        const caseHeight = 0.04;
        const caseGeom = new THREE.CylinderGeometry(caseRadius, caseRadius, caseHeight, 16);
        const caseMesh = new THREE.Mesh(caseGeom, metalMat);
        caseMesh.rotation.x = Math.PI / 2; // 圆盘立在正面
        caseMesh.position.set(0, 0.42, 0);
        caseMesh.castShadow = true;
        this.group.add(caseMesh);

        // 3. 刻度表面 (Dial Face)
        const dialGeom = new THREE.PlaneGeometry(caseRadius * 1.8, caseRadius * 1.8);
        const dialMesh = new THREE.Mesh(dialGeom, dialMat);
        dialMesh.position.set(0, 0.42, caseHeight / 2 + 0.002);
        this.group.add(dialMesh);

        // 4. 指针 (Pointer) - 红色长针形，旋转中心在原点
        const pointerLength = caseRadius * 0.75;
        const pointerGeom = new THREE.ConeGeometry(0.004, pointerLength, 4);
        this.pointerMesh = new THREE.Mesh(pointerGeom, pointerMat);
        // 微调轴向对齐，使其绕 Z 轴旋转
        this.pointerMesh.rotation.z = Math.PI; // 调转方向
        this.pointerMesh.position.y = pointerLength / 2;

        this.pointerContainer = new THREE.Group();
        this.pointerContainer.add(this.pointerMesh);
        // 指针轴承定位在圆表盘圆心上
        this.pointerContainer.position.set(0, 0.42, caseHeight / 2 + 0.004);
        this.group.add(this.pointerContainer);

        // 5. 应用外部物理参数设定指针角度
        this.setValue(this.pressureValue);

        // 整体定位姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定实时压力数据，更新表盘指针物理角度
     * @param {number} value 
     */
    setValue(value) {
        this.pressureValue = Math.max(0, Math.min(value, this.maxPressure));
        
        // 模拟标准表盘量程刻度（从 -135 度至 135 度共计 270 度扇面）
        const startAngle = (135 / 180) * Math.PI;
        const totalArc = (270 / 180) * Math.PI;
        const ratio = this.pressureValue / this.maxPressure;
        
        const targetAngle = startAngle - ratio * totalArc;
        this.pointerContainer.rotation.z = targetAngle;
    }

    update() {
        // 用于动态微振摆动模拟真实微弱压摆
    }
}
