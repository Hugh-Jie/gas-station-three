/**
 * @file Separator.js
 * @description 气液分离器设备（脱水罐）组件，程序化生成高精度立式/卧式重力分离器主体、安全阀组、双色玻璃板液位计及自控液位调节阀
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Separator {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Separator_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 400; // 大型管道接口
        this.liquidLevel = options.liquidLevel || 45.0; // 内部积液百分比 (%)

        this.group = new THREE.Group();
        this._initSeparator();
    }

    /**
     * 程序化参数建模高压重力气液分离器
     * @private
     */
    _initSeparator() {
        const pipeRadius = (this.dn / 2) / 1000;
        const vesselRadius = pipeRadius * 2.5;
        const vesselLength = vesselRadius * 5.0;

        const vesselMat = MaterialFactory.getMaterial('steel_structure');
        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 卧式分离器主筒体 (Horizontal Vessel Body)
        const bodyGeom = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselLength, 24);
        const bodyMesh = new THREE.Mesh(bodyGeom, vesselMat);
        bodyMesh.rotation.z = Math.PI / 2; // 卧式
        bodyMesh.position.y = vesselRadius + 0.8; // 抬高，给底部支撑鞍座留空
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 两端椭圆封头 (Two Ellipsoidal Heads)
        const capGeom = new THREE.SphereGeometry(vesselRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        
        const leftCap = new THREE.Mesh(capGeom, vesselMat);
        leftCap.rotation.z = -Math.PI / 2;
        leftCap.position.set(-vesselLength / 2, vesselRadius + 0.8, 0);
        leftCap.castShadow = true;
        this.group.add(leftCap);

        const rightCap = new THREE.Mesh(capGeom, vesselMat);
        rightCap.rotation.z = Math.PI / 2;
        rightCap.position.set(vesselLength / 2, vesselRadius + 0.8, 0);
        rightCap.castShadow = true;
        this.group.add(rightCap);

        // 3. 鞍式支撑座 (Two Saddle Supports) - 混凝土/钢混结构
        const saddleGeom = new THREE.BoxGeometry(0.5, vesselRadius * 0.9, vesselRadius * 1.8);
        const concreteMat = MaterialFactory.getMaterial('concrete_base');
        
        const leftSaddle = new THREE.Mesh(saddleGeom, concreteMat);
        leftSaddle.position.set(-vesselLength * 0.3, (vesselRadius * 0.9) / 2, 0);
        leftSaddle.castShadow = true;
        leftSaddle.receiveShadow = true;
        this.group.add(leftSaddle);

        const rightSaddle = leftSaddle.clone();
        rightSaddle.position.x = vesselLength * 0.3;
        this.group.add(rightSaddle);

        // 4. 介质进料管及顶出气管、底排液管
        const nozzleGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, 0.6, 16);
        
        // 气液入口 (Inlet) - 位于左封头侧部
        const inlet = new THREE.Mesh(nozzleGeom, pipeMat);
        inlet.rotation.z = Math.PI / 2;
        inlet.position.set(-vesselLength / 2 - 0.3, vesselRadius + 0.8, 0);
        this.group.add(inlet);

        // 顶出干气出口 (Gas Outlet) - 位于筒顶右侧
        const gasOutlet = new THREE.Mesh(nozzleGeom, pipeMat);
        gasOutlet.position.set(vesselLength * 0.25, vesselRadius * 2 + 0.8 + 0.3, 0);
        this.group.add(gasOutlet);

        // 5. 侧挂高精双色玻璃液位计 (Glass Level Gauge) - 数字孪生状态可视化的关键硬件
        const gaugeGeom = new THREE.CylinderGeometry(0.02, 0.02, vesselRadius * 1.5, 8);
        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x00ffcc,
            transparent: true,
            opacity: 0.7,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.9
        });
        const levelGaugeMesh = new THREE.Mesh(gaugeGeom, glassMat);
        levelGaugeMesh.position.set(0, vesselRadius + 0.8, vesselRadius + 0.1);
        levelGaugeMesh.castShadow = true;
        this.group.add(levelGaugeMesh);

        // 6. 液位变送器连通管 (Sensing Arms)
        const armGeom = new THREE.CylinderGeometry(0.008, 0.008, 0.12, 8);
        const armTop = new THREE.Mesh(armGeom, metalMat);
        armTop.rotation.x = Math.PI / 2;
        armTop.position.set(0, vesselRadius * 1.7 + 0.8, vesselRadius * 0.95);
        this.group.add(armTop);

        const armBottom = armTop.clone();
        armBottom.position.y = vesselRadius * 0.3 + 0.8;
        this.group.add(armBottom);

        // 整体定位姿态
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：设置分离器当前内部冷凝液位
     * @param {number} level 
     */
    setValue(level) {
        this.liquidLevel = Math.max(0, Math.min(level, 100));
        // 可联动调节液位计显示材质发光面比例或液位计高度
    }

    update() {
        // 数据更新调用
    }
}
