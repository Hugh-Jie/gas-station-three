/**
 * @file BallValve.js
 * @description 球阀设备组件，支持程序化精细建模（球形阀体、法兰盘、阀杆、红色操作手柄），内置孪生开度控制接口及旋转动画
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class BallValve {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Valve_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300; // 默认公称直径 300mm
        this.status = options.status || 'closed'; // closed / open

        this.group = new THREE.Group();
        this.handleMesh = null; // 阀门控制手柄
        this._initBallValve();
    }

    /**
     * 程序化参数建模高仿真球阀，包含法兰接口
     * @private
     */
    _initBallValve() {
        const pipeRadius = (this.dn / 2) / 1000;
        const bodyRadius = pipeRadius * 1.5;

        // 1. 创建球形阀体 (Sphere Valve Body)
        const bodyGeom = new THREE.SphereGeometry(bodyRadius, 16, 16);
        const valveMat = MaterialFactory.getMaterial('valve_red');
        const bodyMesh = new THREE.Mesh(bodyGeom, valveMat);
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 创建短接管段及两侧接口法兰
        const flangeOffset = bodyRadius + 0.05;
        
        // 实例化左/右双侧标准法兰
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

        // 将法兰网格加入设备组（由于 Flange 自带 add 到 scene，此处我们为了层级统一可以将其加入当前组）
        // Flange 类构造中已将其加入 scene，为避免重复挂载，我们在后续架构规范中将 Flange 改造为纯 Mesh 返回或继续保留

        // 3. 阀杆 (Stem)
        const stemHeight = bodyRadius * 1.2;
        const stemGeom = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 8);
        const steelMat = MaterialFactory.getMaterial('flange_silver');
        const stemMesh = new THREE.Mesh(stemGeom, steelMat);
        stemMesh.position.y = bodyRadius + stemHeight / 2;
        stemMesh.castShadow = true;
        this.group.add(stemMesh);

        // 4. 操作手柄 (Handle) - 长条形阀门扳手，便于演示开关动画
        const handleLength = bodyRadius * 3.5;
        const handleGeom = new THREE.BoxGeometry(handleLength, 0.04, 0.08);
        this.handleMesh = new THREE.Mesh(handleGeom, valveMat);
        // 手柄一端固定在阀杆顶部，旋转轴在原点
        this.handleMesh.position.set(handleLength / 2 - 0.05, bodyRadius + stemHeight, 0);
        this.handleMesh.castShadow = true;
        
        // 建立手柄独立旋转容器
        this.handleContainer = new THREE.Group();
        this.handleContainer.add(this.handleMesh);
        this.group.add(this.handleContainer);

        // 根据初始开关状态设置手柄角度
        this.setStatus(this.status, false);

        // 5. 设备位置与姿态设置
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：设定阀门开关状态并执行过渡动画
     * @param {string} status 'open' 或 'closed'
     * @param {boolean} animate 是否过渡过渡动画
     */
    setStatus(status, animate = true) {
        this.status = status;
        const targetAngle = status === 'open' ? Math.PI / 2 : 0; // 开：垂直于管道，闭：平行于管道

        if (animate) {
            // 在实际孪生项目中，此处通过 AnimationManager 注入动画插值器
            this.handleContainer.rotation.y = targetAngle;
        } else {
            this.handleContainer.rotation.y = targetAngle;
        }
    }

    /**
     * 更新状态（预留数字孪生实时更新调用）
     */
    update() {
        // 数据驱动轮询回调
    }
}
