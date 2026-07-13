/**
 * @file Road.js
 * @description 工业园区道路类，绘制主干道、支路和十字路口，设置道路标线，并应用物理真实的沥青混凝土 PBR 材质
 */

import * as THREE from 'three';

export class Road {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();
        
        this.width = options.width || 12; // 默认双向双车道宽 12 米
        this.points = options.points || [
            new THREE.Vector3(-150, 0.02, 70),
            new THREE.Vector3(150, 0.02, 70)
        ];

        this.mesh = null;
        this._initRoad();
    }

    /**
     * 根据控制点，通过挤压或网格铺设程序化生成道路
     * @private
     */
    _initRoad() {
        // 创建平直道路网格（以控制点两端建立 Plane）
        const p1 = this.points[0];
        const p2 = this.points[1];
        
        const length = p1.distanceTo(p2);
        const geometry = new THREE.PlaneGeometry(length, this.width);
        
        // 沥青 PBR 材质
        const material = new THREE.MeshStandardMaterial({
            color: 0x222222,          // 柏油黑灰色
            roughness: 0.9,           // 粗糙无光泽
            metalness: 0.1
        });

        this.mesh = new THREE.Mesh(geometry, material);
        
        // 计算道路中心点和旋转角
        const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        this.mesh.position.copy(center);
        
        // 计算水平旋转角度
        const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
        this.mesh.rotation.x = -Math.PI / 2; // 水平放置
        this.mesh.rotation.z = angle;        // 绕 Y 轴（平面内的 Z 轴）旋转到对应方向
        
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // 绘制黄黑色路缘安全标线
        this._createCurbLines(p1, p2, length);
    }

    /**
     * 在道路两侧绘制黄黑相间的工业安全防护路缘石标线
     * @private
     */
    _createCurbLines(p1, p2, length) {
        const angle = Math.atan2(p2.z - p1.z, p2.x - p1.x);
        const halfWidth = this.width / 2;

        const leftOffset = new THREE.Vector3(-Math.sin(angle), 0, Math.cos(angle)).multiplyScalar(halfWidth);
        const rightOffset = leftOffset.clone().negate();

        // 绘制左右路缘石几何体
        this._buildSingleCurb(p1.clone().add(leftOffset), p2.clone().add(leftOffset), length, angle);
        this._buildSingleCurb(p1.clone().add(rightOffset), p2.clone().add(rightOffset), length, angle);
    }

    /**
     * 铺设单侧斑马状安全隔离牙子
     * @private
     */
    _buildSingleCurb(start, end, length, angle) {
        const curbWidth = 0.3;
        const curbHeight = 0.2;
        const curbGeom = new THREE.BoxGeometry(length, curbHeight, curbWidth);
        
        // 使用棋盘格黄黑相间的警告色
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFD700'; // 黄色
        ctx.fillRect(0, 0, 128, 32);
        ctx.fillStyle = '#000000'; // 黑色条纹
        ctx.fillRect(32, 0, 32, 32);
        ctx.fillRect(96, 0, 32, 32);

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(length / 2, 1); // 2米一个循环

        const material = new THREE.MeshStandardMaterial({
            map: texture,
            roughness: 0.7
        });

        const curbMesh = new THREE.Mesh(curbGeom, material);
        const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        curbMesh.position.copy(center);
        curbMesh.position.y += curbHeight / 2; // 微调高度防止穿透地面
        
        curbMesh.rotation.y = -angle;
        curbMesh.castShadow = true;
        curbMesh.receiveShadow = true;

        this.scene.add(curbMesh);
    }
}
