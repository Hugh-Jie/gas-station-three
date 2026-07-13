/**
 * @file SteelSupport.js
 * @description 钢支架（管道支座）组件，负责程序化生成高压管道下方的落地支撑架、双环管卡、螺栓防松垫片及二次灌浆混凝土定位墩，实现管道物理重力支撑效果
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class SteelSupport {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.height = options.height || 0.8; // 支架上端面距地高度
        this.dn = options.dn || 300;        // 所承托管道的公称直径

        this.group = new THREE.Group();
        this._initSteelSupport();
    }

    /**
     * 程序化构建重型工业管架与定位墩
     * @private
     */
    _initSteelSupport() {
        const pipeRadius = (this.dn / 2) / 1000;
        const steelMat = MaterialFactory.getMaterial('steel_structure');
        const concreteMat = MaterialFactory.getMaterial('concrete_base');
        const metalMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 落地混凝土定位基础墩 (Concrete Plinth)
        const plinthWidth = pipeRadius * 3.0;
        const plinthHeight = 0.35;
        const plinthGeom = new THREE.BoxGeometry(plinthWidth, plinthHeight, plinthWidth);
        const plinthMesh = new THREE.Mesh(plinthGeom, concreteMat);
        plinthMesh.position.y = plinthHeight / 2;
        plinthMesh.castShadow = true;
        plinthMesh.receiveShadow = true;
        this.group.add(plinthMesh);

        // 2. 钢支撑槽钢双立柱 (Steel H-Section Columns)
        const colWidth = 0.08;
        const colHeight = this.height - plinthHeight;
        const colGeom = new THREE.BoxGeometry(colWidth, colHeight, colWidth);
        
        const leftCol = new THREE.Mesh(colGeom, steelMat);
        leftCol.position.set(-pipeRadius * 1.1, plinthHeight + colHeight / 2, 0);
        leftCol.castShadow = true;
        this.group.add(leftCol);

        const rightCol = leftCol.clone();
        rightCol.position.x = pipeRadius * 1.1;
        this.group.add(rightCol);

        // 3. 承重槽钢横梁 (Horizontal Beam)
        const beamLength = pipeRadius * 3.2;
        const beamGeom = new THREE.BoxGeometry(beamLength, 0.06, colWidth);
        const beamMesh = new THREE.Mesh(beamGeom, steelMat);
        beamMesh.position.y = this.height - 0.03;
        beamMesh.castShadow = true;
        this.group.add(beamMesh);

        // 4. 抱箍弧形管卡 (Saddle Pipe Clamp)
        const clampRadius = pipeRadius + 0.008; // 略大于管道外径
        const clampThickness = 0.04;
        const clampGeom = new THREE.TorusGeometry(clampRadius, 0.006, 8, 16, Math.PI); // 半圆弧管箍
        const clampMesh = new THREE.Mesh(clampGeom, metalMat);
        clampMesh.position.y = this.height;
        clampMesh.castShadow = true;
        this.group.add(clampMesh);

        // 5. 螺栓固定底耳 (Clamping Flange Ears)
        const earGeom = new THREE.BoxGeometry(0.06, 0.015, clampThickness);
        
        const leftEar = new THREE.Mesh(earGeom, metalMat);
        leftEar.position.set(-clampRadius, this.height, 0);
        this.group.add(leftEar);

        const rightEar = leftEar.clone();
        rightEar.position.x = clampRadius;
        this.group.add(rightEar);

        // 位置与姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }
}
