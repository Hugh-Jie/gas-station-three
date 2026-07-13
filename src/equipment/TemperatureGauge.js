/**
 * @file TemperatureGauge.js
 * @description 温度表仪器组件，程序化生成高精度不锈钢保护套管（Thermowell）、双金属表头外壳、双通道刻度盘及指示指针，内置温度数值双轴孪生更新接口
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class TemperatureGauge {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Temp_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.tempValue = options.tempValue || 20.0;    // 默认温度值 20.0 ℃
        this.maxTemp = options.maxTemp || 100.0;        // 默认最大刻度 100.0 ℃

        this.group = new THREE.Group();
        this.pointerMesh = null; // 指针
        this._initTemperatureGauge();
    }

    /**
     * 程序化参数建模高精度双金属片工业温度计
     * @private
     */
    _initTemperatureGauge() {
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const dialMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const pointerMat = MaterialFactory.getMaterial('valve_red');

        // 1. 底座不锈钢保护套管 (Thermowell / Stem)
        const wellHeight = 0.22;
        const wellGeom = new THREE.CylinderGeometry(0.012, 0.012, wellHeight, 8);
        const wellMesh = new THREE.Mesh(wellGeom, metalMat);
        wellMesh.position.y = wellHeight / 2;
        wellMesh.castShadow = true;
        this.group.add(wellMesh);

        // 2. 六角安装螺母 (Hex Nut Base)
        const nutGeom = new THREE.CylinderGeometry(0.024, 0.024, 0.04, 6); // 六边形
        const nutMesh = new THREE.Mesh(nutGeom, metalMat);
        nutMesh.position.y = wellHeight - 0.02;
        nutMesh.castShadow = true;
        this.group.add(nutMesh);

        // 3. 倾斜万向节连接器 (Universal Adjustable Joint Elbow)
        const jointGeom = new THREE.SphereGeometry(0.02, 12, 12);
        const jointMesh = new THREE.Mesh(jointGeom, metalMat);
        jointMesh.position.y = wellHeight + 0.01;
        this.group.add(jointMesh);

        // 4. 表壳 (Gauge Case) - 稍作向后倾斜 30 度，贴合现场人机工程读数习惯
        const caseRadius = 0.075;
        const caseHeight = 0.035;
        const caseGeom = new THREE.CylinderGeometry(caseRadius, caseRadius, caseHeight, 16);
        const caseMesh = new THREE.Mesh(caseGeom, metalMat);
        caseMesh.rotation.x = Math.PI / 2 - 0.2; // 略微后倾
        caseMesh.position.set(0, wellHeight + 0.1, 0.02);
        caseMesh.castShadow = true;
        this.group.add(caseMesh);

        // 5. 刻度盘面 (Dial Face)
        const dialGeom = new THREE.PlaneGeometry(caseRadius * 1.8, caseRadius * 1.8);
        const dialMesh = new THREE.Mesh(dialGeom, dialMat);
        dialMesh.rotation.x = -0.2; // 与表壳法线平行
        dialMesh.position.set(0, wellHeight + 0.1, 0.02 + caseHeight / 2 + 0.001);
        this.group.add(dialMesh);

        // 6. 指针 (Pointer) - 红色长针形，旋转中心在原点
        const pointerLength = caseRadius * 0.72;
        const pointerGeom = new THREE.ConeGeometry(0.0035, pointerLength, 4);
        this.pointerMesh = new THREE.Mesh(pointerGeom, pointerMat);
        this.pointerMesh.rotation.z = Math.PI; // 调转方向
        this.pointerMesh.position.y = pointerLength / 2;

        this.pointerContainer = new THREE.Group();
        this.pointerContainer.add(this.pointerMesh);
        // 定位在倾斜表盘圆心上
        this.pointerContainer.position.set(0, wellHeight + 0.1, 0.02 + caseHeight / 2 + 0.003);
        this.pointerContainer.rotation.x = -0.2; // 与表盘平行
        this.group.add(this.pointerContainer);

        // 初始化指针物理角度
        this.setValue(this.tempValue);

        // 整体定位姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定实时温度数据，更新指示指针物理角度
     * @param {number} value 
     */
    setValue(value) {
        this.tempValue = Math.max(-50, Math.min(value, this.maxTemp));
        
        // 刻度盘从 -120 度至 120 度共计 240 度扇面
        const startAngle = (120 / 180) * Math.PI;
        const totalArc = (240 / 180) * Math.PI;
        // 把温度范围标准化映射到比率
        const minTempLimit = -50;
        const tempSpan = this.maxTemp - minTempLimit;
        const ratio = (this.tempValue - minTempLimit) / tempSpan;
        
        const targetAngle = startAngle - ratio * totalArc;
        this.pointerContainer.rotation.z = targetAngle;
    }

    update() {
        // 数据驱动轮询回调
    }
}
