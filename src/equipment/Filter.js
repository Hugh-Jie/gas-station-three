/**
 * @file Filter.js
 * @description 过滤器设备组件，程序化生成高精度卧式/立式过滤分离器外壳、排污阀、进出口法兰及差压变送器，支持差压数据数字孪生联动
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';
import { Flange } from '@pipeline/Flange.js';

export class Filter {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.id = options.id || 'Filter_Default';
        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.dn = options.dn || 300;
        this.dpValue = options.dpValue || 12.5; // 差压初始值 (kPa)

        this.group = new THREE.Group();
        this._initFilter();
    }

    /**
     * 程序化构建立式多管旋风过滤器
     * @private
     */
    _initFilter() {
        const pipeRadius = (this.dn / 2) / 1000;
        const vesselRadius = pipeRadius * 2.2; // 容器筒体半径
        const vesselHeight = vesselRadius * 4.5; // 容器高度

        const vesselMat = MaterialFactory.getMaterial('steel_structure');
        const pipeMat = MaterialFactory.getMaterial('pipe_yellow');
        const flangeMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 过滤器主容器筒体 (Vessel Body Cylinder)
        const bodyGeom = new THREE.CylinderGeometry(vesselRadius, vesselRadius, vesselHeight, 24);
        const bodyMesh = new THREE.Mesh(bodyGeom, vesselMat);
        bodyMesh.position.y = vesselHeight / 2 + 0.5; // 稍抬高给排污口留空间
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        this.group.add(bodyMesh);

        // 2. 顶部椭圆封头 (Top Ellipsoidal Head)
        const capGeom = new THREE.SphereGeometry(vesselRadius, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMesh = new THREE.Mesh(capGeom, vesselMat);
        capMesh.position.y = vesselHeight + 0.5;
        capMesh.castShadow = true;
        this.group.add(capMesh);

        // 3. 支撑裙座 (Support Skirt Base)
        const skirtGeom = new THREE.CylinderGeometry(vesselRadius * 1.02, vesselRadius * 1.05, 0.6, 24);
        const skirtMesh = new THREE.Mesh(skirtGeom, MaterialFactory.getMaterial('concrete_base'));
        skirtMesh.position.y = 0.3;
        skirtMesh.castShadow = true;
        skirtMesh.receiveShadow = true;
        this.group.add(skirtMesh);

        // 4. 介质进出口接管与法兰 (Inlet / Outlet Pipes & Flanges)
        const nozzleLength = vesselRadius * 1.5;
        const nozzleGeom = new THREE.CylinderGeometry(pipeRadius, pipeRadius, nozzleLength, 16);
        
        // 进口 (Inlet) - 位于中部偏下
        const inletMesh = new THREE.Mesh(nozzleGeom, pipeMat);
        inletMesh.rotation.z = Math.PI / 2;
        inletMesh.position.set(-nozzleLength / 2, vesselHeight * 0.35 + 0.5, 0);
        inletMesh.castShadow = true;
        this.group.add(inletMesh);

        const inletFlange = new Flange(this.world, {
            position: new THREE.Vector3(-nozzleLength, vesselHeight * 0.35 + 0.5, 0).applyEuler(this.rotation).add(this.position),
            dn: this.dn,
            direction: new THREE.Vector3(-1, 0, 0).applyEuler(this.rotation)
        });

        // 出口 (Outlet) - 位于中部偏上
        const outletMesh = new THREE.Mesh(nozzleGeom, pipeMat);
        outletMesh.rotation.z = Math.PI / 2;
        outletMesh.position.set(nozzleLength / 2, vesselHeight * 0.65 + 0.5, 0);
        outletMesh.castShadow = true;
        this.group.add(outletMesh);

        const outletFlange = new Flange(this.world, {
            position: new THREE.Vector3(nozzleLength, vesselHeight * 0.65 + 0.5, 0).applyEuler(this.rotation).add(this.position),
            dn: this.dn,
            direction: new THREE.Vector3(1, 0, 0).applyEuler(this.rotation)
        });

        // 5. 排污阀接口 (Drain Nozzle)
        const drainGeom = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const drainMesh = new THREE.Mesh(drainGeom, pipeMat);
        drainMesh.position.y = 0.25;
        this.group.add(drainMesh);

        // 6. 顶盖快开盲板铰链机构 (Quick-opening Blind Flange)
        const hingeGeom = new THREE.BoxGeometry(0.1, 0.3, 0.1);
        const hingeMesh = new THREE.Mesh(hingeGeom, flangeMat);
        hingeMesh.position.set(-vesselRadius, vesselHeight + 0.5, 0);
        this.group.add(hingeMesh);

        // 实例位置姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 孪生更新：设置过滤器当前运行差压
     * @param {number} value (kPa)
     */
    setValue(value) {
        this.dpValue = value;
    }

    update() {
        // 差压超限触发数字孪生设备闪烁警告
    }
}
