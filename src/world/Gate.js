/**
 * @file Gate.js
 * @description 场站大门组件，包含混凝土立柱与高仿真程序化金属双开大门
 */

import * as THREE from 'three';

export class Gate {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 140); // 默认位于南侧围栏正中
        this.width = options.width || 8.0; // 门宽 8 米
        this.height = options.height || 2.4; // 门高 2.4 米

        this.group = new THREE.Group();
        this._initGate();
    }

    /**
     * 程序化构造工业大门与混凝土门柱
     * @private
     */
    _initGate() {
        this.group.position.copy(this.position);

        // 1. 创建左右混凝土柱子 (Pillar)
        const pillarGeom = new THREE.BoxGeometry(0.8, this.height + 0.4, 0.8);
        const pillarMat = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            roughness: 0.9,
            metalness: 0.1
        });

        const leftPillar = new THREE.Mesh(pillarGeom, pillarMat);
        leftPillar.position.set(-this.width / 2 - 0.4, (this.height + 0.4) / 2, 0);
        leftPillar.castShadow = true;
        leftPillar.receiveShadow = true;
        this.group.add(leftPillar);

        const rightPillar = leftPillar.clone();
        rightPillar.position.x = this.width / 2 + 0.4;
        this.group.add(rightPillar);

        // 2. 创建双开镂空金属门板
        const leafWidth = this.width / 2 - 0.05;
        const leafGeom = new THREE.BoxGeometry(leafWidth, this.height, 0.08);
        
        // 双开大门使用带灰色金属涂料的防锈钢材质
        const leafMat = new THREE.MeshStandardMaterial({
            color: 0x3a4f3f, // 工业军绿色/深墨绿色涂装
            roughness: 0.4,
            metalness: 0.8
        });

        // 左门页
        this.leftLeaf = new THREE.Mesh(leafGeom, leafMat);
        this.leftLeaf.position.set(-leafWidth / 2 - 0.02, this.height / 2, 0);
        this.leftLeaf.castShadow = true;
        this.group.add(this.leftLeaf);

        // 右门页
        this.rightLeaf = new THREE.Mesh(leafGeom, leafMat);
        this.rightLeaf.position.set(leafWidth / 2 + 0.02, this.height / 2, 0);
        this.rightLeaf.castShadow = true;
        this.group.add(this.rightLeaf);

        this.scene.add(this.group);
    }

    /**
     * 孪生控制接口：开门
     */
    open() {
        // 门页沿门铰链（即门柱内侧边缘）旋转，此处进行简化平移与旋转模拟
        this.leftLeaf.rotation.y = Math.PI / 2;
        this.leftLeaf.position.set(-this.width / 2, this.height / 2, -this.width / 4);

        this.rightLeaf.rotation.y = -Math.PI / 2;
        this.rightLeaf.position.set(this.width / 2, this.height / 2, -this.width / 4);
    }

    /**
     * 孪生控制接口：关门
     */
    close() {
        const leafWidth = this.width / 2 - 0.05;
        this.leftLeaf.rotation.y = 0;
        this.leftLeaf.position.set(-leafWidth / 2 - 0.02, this.height / 2, 0);

        this.rightLeaf.rotation.y = 0;
        this.rightLeaf.position.set(leafWidth / 2 + 0.02, this.height / 2, 0);
    }
}
