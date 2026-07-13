/**
 * @file Building.js
 * @description 场站内建筑类，包含办公楼、控制室等。采用高精度的 PBR 混凝土、玻璃、金属及涂料材质，还原真实工业厂房外观。
 */

import * as THREE from 'three';

export class Building {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, -80); // 默认放置于后侧
        this.width = options.width || 40.0;
        this.height = options.height || 6.0;
        this.depth = options.depth || 12.0;
        this.name = options.name || 'ControlRoom';

        this.group = new THREE.Group();
        this._initBuilding();
    }

    /**
     * 程序化构建带窗户、大门、防雨棚及勒脚的工业控制厂房
     * @private
     */
    _initBuilding() {
        this.group.position.copy(this.position);

        // 1. 厂房主体 (Main Body)
        const bodyGeom = new THREE.BoxGeometry(this.width, this.height, this.depth);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0xeeeeee, // 白色乳胶漆墙面
            roughness: 0.8,
            metalness: 0.05
        });
        const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        bodyMesh.position.y = this.height / 2;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 勒脚 (Plinth) - 建筑底部深灰色防水层
        const plinthHeight = 0.6;
        const plinthGeom = new THREE.BoxGeometry(this.width + 0.05, plinthHeight, this.depth + 0.05);
        const plinthMat = new THREE.MeshStandardMaterial({
            color: 0x333333, // 深灰花岗岩/水泥砂浆面
            roughness: 0.9,
            metalness: 0.1
        });
        const plinthMesh = new THREE.Mesh(plinthGeom, plinthMat);
        plinthMesh.position.y = plinthHeight / 2;
        plinthMesh.castShadow = true;
        plinthMesh.receiveShadow = true;
        this.group.add(plinthMesh);

        // 3. 门窗系统 (Windows and Doors) - 程序化排布多个铝合金采光窗
        const windowWidth = 2.0;
        const windowHeight = 1.8;
        const windowGeom = new THREE.BoxGeometry(windowWidth, windowHeight, 0.2);
        
        const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3, metalness: 0.8 }); // 黑色铝合金
        const windowGlassMat = new THREE.MeshPhysicalMaterial({ // 真实玻璃折射
            color: 0x88ccff,
            transparent: true,
            opacity: 0.6,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.9,
            ior: 1.5
        });

        // 窗户组合网格
        const singleWindow = new THREE.Group();
        const frame = new THREE.Mesh(new THREE.BoxGeometry(windowWidth + 0.1, windowHeight + 0.1, 0.1), windowFrameMat);
        const glass = new THREE.Mesh(windowGeom, windowGlassMat);
        glass.position.z = 0.05;
        singleWindow.add(frame, glass);

        const windowSpacing = 6.0;
        const windowCount = Math.floor(this.width / windowSpacing) - 1;
        const startX = -((windowCount - 1) * windowSpacing) / 2;

        for (let i = 0; i < windowCount; i++) {
            const win = singleWindow.clone();
            // 窗户布置在建筑前壁上
            win.position.set(startX + i * windowSpacing, this.height / 2, this.depth / 2 + 0.05);
            this.group.add(win);
        }

        // 4. 工业钢制疏散防暴大门
        const doorWidth = 2.4;
        const doorHeight = 2.8;
        const doorGeom = new THREE.BoxGeometry(doorWidth, doorHeight, 0.15);
        const doorMat = new THREE.MeshStandardMaterial({
            color: 0x555555, // 钢制本色或灰色漆
            roughness: 0.5,
            metalness: 0.7
        });
        const doorMesh = new THREE.Mesh(doorGeom, doorMat);
        // 门位于一侧
        doorMesh.position.set(startX + windowCount * windowSpacing - 2, doorHeight / 2, this.depth / 2 + 0.05);
        doorMesh.castShadow = true;
        this.group.add(doorMesh);

        this.scene.add(this.group);
    }

    /**
     * 获取大楼空间包围盒
     * @returns {THREE.Box3}
     */
    getBounds() {
        return new THREE.Box3().setFromObject(this.group);
    }
}
