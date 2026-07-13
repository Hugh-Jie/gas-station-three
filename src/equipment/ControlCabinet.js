/**
 * @file ControlCabinet.js
 * @description 站内防爆控制柜设备组件，程序化生成高精度防爆壳体、密封线缆接头、LED指示灯组、触控交互显示屏及紧急停机按钮（ESD），支持状态灯与报警数字孪生联动
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class ControlCabinet {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Cabinet_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.status = options.status || 'normal'; // normal / alarm / offline

        this.group = new THREE.Group();
        this.statusIndicatorMat = null; // 指示灯自发光材质
        this._initControlCabinet();
    }

    /**
     * 程序化参数建模防爆户外控制柜
     * @private
     */
    _initControlCabinet() {
        const bodyMat = MaterialFactory.getMaterial('steel_structure', { color: 0xcccccc }); // 琴台灰色静电喷塑外壳
        const metalMat = MaterialFactory.getMaterial('flange_silver');
        const esdMat = MaterialFactory.getMaterial('valve_red'); // 红色ESD按钮

        const width = 1.0;
        const height = 1.8;
        const depth = 0.8;

        // 1. 控制柜主体 (Cabinet Body)
        const bodyGeom = new THREE.BoxGeometry(width, height, depth);
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.position.y = height / 2;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 柜底安装槽钢底座 (Plinth Support Base)
        const baseGeom = new THREE.BoxGeometry(width + 0.05, 0.15, depth + 0.05);
        const baseMesh = new THREE.Mesh(baseGeom, MaterialFactory.getMaterial('steel_structure', { color: 0x333333 }));
        baseMesh.position.y = 0.075;
        baseMesh.castShadow = true;
        this.group.add(baseMesh);

        // 3. 柜顶防雨斜顶帽 (Rain Roof Canopy)
        const roofGeom = new THREE.BoxGeometry(width + 0.1, 0.08, depth + 0.1);
        const roofMesh = new THREE.Mesh(roofGeom, bodyMat);
        roofMesh.position.y = height + 0.04;
        roofMesh.rotation.x = 0.08; // 倾斜防雨
        roofMesh.castShadow = true;
        this.group.add(roofMesh);

        // 4. 柜门嵌入式触控显示屏 (Touch LCD Screen)
        const screenWidth = 0.5;
        const screenHeight = 0.35;
        const screenGeom = new THREE.PlaneGeometry(screenWidth, screenHeight);
        const screenMat = new THREE.MeshBasicMaterial({
            color: 0x002244, // 液晶未通电底色
            side: THREE.DoubleSide
        });
        const screenMesh = new THREE.Mesh(screenGeom, screenMat);
        screenMesh.position.set(0, height * 0.65, depth / 2 + 0.002);
        this.group.add(screenMesh);

        // 5. 防爆指示灯组 (Indicator Lights) - 红、黄、绿三色
        const lightRadius = 0.015;
        const lightGeom = new THREE.SphereGeometry(lightRadius, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2);
        
        // 运行状态指示灯材质
        this.statusIndicatorMat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

        const runLight = new THREE.Mesh(lightGeom, this.statusIndicatorMat);
        runLight.rotation.x = Math.PI / 2;
        runLight.position.set(-0.15, height * 0.82, depth / 2 + 0.01);
        this.group.add(runLight);

        const alarmLightMat = new THREE.MeshBasicMaterial({ color: 0x330000 }); // 默认报警灯灭
        this.alarmLight = new THREE.Mesh(lightGeom, alarmLightMat);
        this.alarmLight.rotation.x = Math.PI / 2;
        this.alarmLight.position.set(0, height * 0.82, depth / 2 + 0.01);
        this.group.add(this.alarmLight);

        // 6. 突出型防爆紧急断电ESD红色大蘑菇按钮 (ESD Emergency Push Button)
        const esdBaseGeom = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8);
        const esdBase = new THREE.Mesh(esdBaseGeom, metalMat);
        esdBase.rotation.x = Math.PI / 2;
        esdBase.position.set(0.2, height * 0.5, depth / 2 + 0.01);
        this.group.add(esdBase);

        const esdCapGeom = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12);
        const esdCap = new THREE.Mesh(esdCapGeom, esdMat);
        esdCap.rotation.x = Math.PI / 2;
        esdCap.position.set(0.2, height * 0.5, depth / 2 + 0.025);
        this.group.add(esdCap);

        // 柜体定位姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定控制柜运行与报警状态，同步切换物理指示灯光效
     * @param {string} status 'normal' / 'alarm' / 'offline'
     */
    setStatus(status) {
        this.status = status;
        if (status === 'normal') {
            this.statusIndicatorMat.color.setHex(0x00ff00); // 绿灯亮
            this.alarmLight.material.color.setHex(0x330000);  // 红灯灭
        } else if (status === 'alarm') {
            this.statusIndicatorMat.color.setHex(0x003300); // 绿灯灭
            this.alarmLight.material.color.setHex(0xff0000);  // 红灯亮（报警）
        } else if (status === 'offline') {
            this.statusIndicatorMat.color.setHex(0x333333); // 全灭
            this.alarmLight.material.color.setHex(0x333333);
        }
    }

    update() {
        // 用于控制指示灯在报警时执行高频呼吸或闪烁动画
    }
}
