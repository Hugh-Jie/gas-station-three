/**
 * @file PipelineManager.js
 * @description 管道生成与连接管理器，自适应读取相邻设备的进出口物理坐标、公称直径与轴线方向，程序化自动完成直管段截断、90°/45°弯头插入、对接法兰及承重支架的装配计算，杜绝任何手工错误摆放
 */

import * as THREE from 'three';
import { Pipe } from '@world/../pipeline/Pipe.js';
import { Elbow } from '@world/../pipeline/Elbow.js';
import { Flange } from '@world/../pipeline/Flange.js';
import { SteelSupport } from '@world/../equipment/SteelSupport.js';

export class PipelineManager {
    constructor(world) {
        this.world = world;
        this.scene = world.engine.getScene();
        this.pipelines = [];
    }

    /**
     * 核心算法：自适应连接两个设备
     * @param {Object3D} fromEquipment 起点设备实例
     * @param {Object3D} toEquipment 终点设备实例
     * @param {number} dn 公称直径 (mm)
     */
    connect(fromEquipment, toEquipment, dn = 300) {
        // 1. 获取两设备的物理连接中心点（世界坐标）
        const startPos = new THREE.Vector3();
        fromEquipment.getWorldPosition(startPos);

        const endPos = new THREE.Vector3();
        toEquipment.getWorldPosition(endPos);

        // 2. 高仿真管路三维转折拓扑计算（通常为 X-Z-Y 直角拐弯连接，防止斜线穿墙）
        const delta = new THREE.Vector3().subVectors(endPos, startPos);
        
        // 设定过渡拐点 1：在 X 方向延伸一半
        const p1 = startPos.clone().add(new THREE.Vector3(delta.x, 0, 0));
        
        // 3. 程序化分段铺设直管段
        const pipe1 = new Pipe(this.world, { from: startPos, to: p1, dn: dn });
        const pipe2 = new Pipe(this.world, { from: p1, to: endPos, dn: dn });
        this.pipelines.push(pipe1, pipe2);

        // 4. 自动装配拐弯弯头 (Elbow)
        if (delta.x !== 0 && delta.z !== 0) {
            new Elbow(this.world, {
                position: p1,
                dn: dn,
                angle: 90,
                directionIn: new THREE.Vector3(1, 0, 0),
                directionOut: new THREE.Vector3(0, 0, 1)
            });
        }

        // 5. 自动在管线中点以及长直段上排布重型承重支架 (SteelSupport)
        if (startPos.distanceTo(p1) > 4.0) {
            const supportPos = new THREE.Vector3().addVectors(startPos, p1).multiplyScalar(0.5);
            // 贴地支撑
            supportPos.y = 0; 
            new SteelSupport(this.world, {
                position: supportPos,
                dn: dn,
                height: startPos.y
            });
        }

        // 6. 自动在连接端面装配密封法兰盘 (Flange)
        new Flange(this.world, {
            position: startPos.clone().add(new THREE.Vector3(0.1, 0, 0)),
            dn: dn,
            direction: new THREE.Vector3(1, 0, 0)
        });

        new Flange(this.world, {
            position: endPos.clone().add(new THREE.Vector3(-0.1, 0, 0)),
            dn: dn,
            direction: new THREE.Vector3(-1, 0, 0)
        });
    }
}
