/**
 * @file Flange.js
 * @description 法兰管件组件，负责程序化计算并在管道连接处、设备接口处生成高精度银色金属法兰盘和受力螺栓组
 */

import * as THREE from 'three';
import { PIPELINE } from '@config/Constant.js';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Flange {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.dn = options.dn || PIPELINE.DEFAULT_DN;
        this.direction = options.direction || new THREE.Vector3(0, 1, 0); // 法兰盘法线轴向

        this.group = new THREE.Group();
        this._initFlange();
    }

    /**
     * 程序化生成带环形受力螺栓组的工业标准法兰
     * @private
     */
    _initFlange() {
        const pipeRadius = (this.dn / 2) / 1000;
        
        // 法兰盘尺寸计算：外径通常比管道外径大 30% 到 50%
        const flangeOuterRadius = pipeRadius * 1.45;
        const flangeHeight = 0.06; // 法兰盘厚度 60mm

        const flangeMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 创建法兰盘主体 (Flange Ring)
        const flangeGeom = new THREE.CylinderGeometry(flangeOuterRadius, flangeOuterRadius, flangeHeight, PIPELINE.SEGMENTS);
        const flangeMesh = new THREE.Mesh(flangeGeom, flangeMat);
        flangeMesh.castShadow = true;
        flangeMesh.receiveShadow = true;
        this.group.add(flangeMesh);

        // 2. 程序化生成环形紧固螺栓组 (Bolts Circle)
        const boltCount = this._getBoltCountByDN(this.dn);
        const boltPitchRadius = (pipeRadius + flangeOuterRadius) / 2; // 螺栓中心分布圆半径
        const boltRadius = 0.012; // 螺栓半径 12mm
        const boltHeight = 0.08;  // 螺栓凸出高度 80mm

        const boltGeom = new THREE.CylinderGeometry(boltRadius, boltRadius, boltHeight, 8);

        for (let i = 0; i < boltCount; i++) {
            const angle = (i / boltCount) * Math.PI * 2;
            const boltMesh = new THREE.Mesh(boltGeom, flangeMat);
            
            // 环形等距排布
            boltMesh.position.set(
                Math.cos(angle) * boltPitchRadius,
                0, // 螺栓轴线与法兰盘轴线平行，位于同一高度水平内
                Math.sin(angle) * boltPitchRadius
            );
            
            boltMesh.castShadow = true;
            this.group.add(boltMesh);
        }

        // 3. 变换对齐
        this.group.position.copy(this.position);

        // 旋转对齐：将默认朝 Y 轴的法兰组合体旋转至 direction 方向
        const alignAxis = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(alignAxis, this.direction.clone().normalize());
        this.group.setRotationFromQuaternion(quaternion);

        this.scene.add(this.group);
    }

    /**
     * 依据公称直径 DN 自动计算符合工业耐压规范的标准螺栓孔数量
     * @param {number} dn 
     * @returns {number}
     * @private
     */
    _getBoltCountByDN(dn) {
        if (dn <= 100) return 4;
        if (dn <= 200) return 8;
        if (dn <= 400) return 12;
        if (dn <= 600) return 16;
        return 24;
    }
}
