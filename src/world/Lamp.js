/**
 * @file Lamp.js
 * @description 场站路灯组件，包含灯杆、灯头，并在灯头处绑定 SpotLight（聚光灯）模拟夜间真实照明锥，支持数字孪生日夜光影联动
 */

import * as THREE from 'three';

export class Lamp {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.height = options.height || 6.5; // 路灯高度 6.5 米
        this.color = options.color || 0xffffff;

        this.group = new THREE.Group();
        this._initLamp();
    }

    /**
     * 程序化构建高仿真路灯，并配置光源和照射阴影
     * @private
     */
    _initLamp() {
        this.group.position.copy(this.position);

        // 1. 灯杆 (Pole) - 变截面圆柱体
        const poleGeom = new THREE.CylinderGeometry(0.05, 0.12, this.height, 12);
        const poleMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc, // 银灰色不锈钢
            roughness: 0.3,
            metalness: 0.8
        });
        const poleMesh = new THREE.Mesh(poleGeom, poleMat);
        poleMesh.position.y = this.height / 2;
        poleMesh.castShadow = true;
        poleMesh.receiveShadow = true;
        this.group.add(poleMesh);

        // 2. 灯臂 (Arm) - 悬挑弯折管
        const armGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.5, 8);
        const armMesh = new THREE.Mesh(armGeom, poleMat);
        armMesh.rotation.z = Math.PI / 3; // 倾斜悬挑
        armMesh.position.set(0.6, this.height - 0.3, 0);
        armMesh.castShadow = true;
        this.group.add(armMesh);

        // 3. 灯头 (Fixture) - 扁平流线型外壳
        const headGeom = new THREE.BoxGeometry(0.6, 0.15, 0.3);
        const headMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.5,
            metalness: 0.6
        });
        const headMesh = new THREE.Mesh(headGeom, headMat);
        headMesh.position.set(1.2, this.height - 0.7, 0);
        headMesh.castShadow = true;
        this.group.add(headMesh);

        // 4. 发光面 (Emitter) - 自发光材质
        const emitterGeom = new THREE.PlaneGeometry(0.4, 0.2);
        this.emitterMat = new THREE.MeshBasicMaterial({
            color: 0xffffee, // 暖白自发光
            side: THREE.DoubleSide
        });
        const emitterMesh = new THREE.Mesh(emitterGeom, this.emitterMat);
        emitterMesh.rotation.x = Math.PI / 2;
        emitterMesh.position.set(1.2, this.height - 0.78, 0);
        this.group.add(emitterMesh);

        // 5. 真实照亮物理光源 (SpotLight)
        this.light = new THREE.SpotLight(0xfff3cc, 8, 40, Math.PI / 4, 0.5, 1);
        this.light.position.set(1.2, this.height - 0.8, 0);
        this.light.castShadow = true;
        
        // 限制阴影贴图，保证多路灯场景不卡顿
        this.light.shadow.mapSize.width = 512;
        this.light.shadow.mapSize.height = 512;
        this.light.shadow.bias = -0.001;

        // 设置照向地面
        const target = new THREE.Object3D();
        target.position.set(1.2, 0, 0);
        this.group.add(target);
        this.light.target = target;

        this.group.add(this.light);
        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：开关灯
     * @param {boolean} on 
     */
    toggle(on) {
        this.light.visible = on;
        this.emitterMat.color.setHex(on ? 0xffffee : 0x222222);
    }
}
