/**
 * @file Fence.js
 * @description 工业园区安全围栏类，根据边界坐标序列程序化生成封闭/半封闭的工业隔离网栅
 */

import * as THREE from 'three';

export class Fence {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        // 默认围栏环绕场站四周
        this.points = options.points || [
            new THREE.Vector3(-140, 0, -140),
            new THREE.Vector3(140, 0, -140),
            new THREE.Vector3(140, 0, 140),
            new THREE.Vector3(-140, 0, 140),
            new THREE.Vector3(-140, 0, -140) // 闭合
        ];

        this.fenceHeight = options.height || 2.5; // 标准工业隔离网高度 2.5 米
        this.postInterval = options.postInterval || 3.0; // 立柱间距 3 米

        this.group = new THREE.Group();
        this._initFence();
    }

    /**
     * 程序化组装网格栅栏与支撑立柱
     * @private
     */
    _initFence() {
        const postGeom = new THREE.CylinderGeometry(0.06, 0.06, this.fenceHeight, 8);
        const postMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.5, metalness: 0.8 });

        for (let i = 0; i < this.points.length - 1; i++) {
            const start = this.points[i];
            const end = this.points[i + 1];
            
            const segmentVec = new THREE.Vector3().subVectors(end, start);
            const segmentLength = segmentVec.length();
            const direction = segmentVec.clone().normalize();
            const angle = Math.atan2(direction.z, direction.x);

            // 1. 沿线排布支撑立柱
            const postCount = Math.floor(segmentLength / this.postInterval) + 1;
            for (let j = 0; j < postCount; j++) {
                const ratio = j / (postCount - 1);
                const postPos = new THREE.Vector3().lerpVectors(start, end, ratio);
                
                const postMesh = new THREE.Mesh(postGeom, postMat);
                postMesh.position.copy(postPos);
                postMesh.position.y += this.fenceHeight / 2;
                postMesh.castShadow = true;
                postMesh.receiveShadow = true;
                this.group.add(postMesh);
            }

            // 2. 创建防护网扇面
            const gridWidth = segmentLength;
            const gridGeom = new THREE.PlaneGeometry(gridWidth, this.fenceHeight - 0.2);
            
            // 程序化生成带有透明网格通道的半透明栅栏贴图，避免大量细长实物几何体导致 WebGL 性能雪崩
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#228B22'; // 工业绿色防护涂层
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, 64, 64);
            ctx.beginPath();
            ctx.moveTo(0, 0); ctx.lineTo(64, 64);
            ctx.moveTo(64, 0); ctx.lineTo(0, 64);
            ctx.stroke();

            const gridTex = new THREE.CanvasTexture(canvas);
            gridTex.wrapS = THREE.RepeatWrapping;
            gridTex.wrapT = THREE.RepeatWrapping;
            gridTex.repeat.set(gridWidth * 2, this.fenceHeight * 2);

            const gridMat = new THREE.MeshStandardMaterial({
                map: gridTex,
                alphaMap: gridTex,
                transparent: true,
                side: THREE.DoubleSide,
                roughness: 0.6,
                metalness: 0.3
            });

            const gridMesh = new THREE.Mesh(gridGeom, gridMat);
            const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
            gridMesh.position.copy(center);
            gridMesh.position.y += this.fenceHeight / 2;
            
            gridMesh.rotation.y = -angle;
            
            this.group.add(gridMesh);
        }

        this.scene.add(this.group);
    }
}
