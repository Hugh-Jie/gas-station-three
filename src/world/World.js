/**
 * @file World.js
 * @description 世界管理器，负责场景中所有静态地物、公共设施、天空、绿化及动态设备的统一生命周期管理与层级挂载
 */

import * as THREE from 'three';
import { Ground } from './Ground.js';
import { Road } from './Road.js';
import { Fence } from './Fence.js';
import { Gate } from './Gate.js';
import { Building } from './Building.js';

export class World {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();

        this.ground = null;
        this.road = null;
        this.fence = null;
        this.gate = null;
        this.buildings = [];

        this._initWorld();
    }

    /**
     * 程序化构建整个数字孪生站场的环境基础
     * @private
     */
    _initWorld() {
        // 1. 创建工业园区地面
        this.ground = new Ground(this);

        // 2. 铺设环绕与进出主道路
        this.road = new Road(this, {
            width: 10,
            points: [
                new THREE.Vector3(-140, 0.01, 100),
                new THREE.Vector3(140, 0.01, 100)
            ]
        });

        // 3. 安全防护隔离网
        this.fence = new Fence(this);

        // 4. 双开金属防盗大门
        this.gate = new Gate(this, {
            position: new THREE.Vector3(0, 0, 140),
            width: 8.0,
            height: 2.5
        });

        // 5. 综合办公楼与中控分析室
        this.buildings.push(new Building(this, {
            name: 'OfficeBuilding',
            position: new THREE.Vector3(50, 0, -90),
            width: 50.0,
            height: 7.0,
            depth: 15.0
        }));

        this.buildings.push(new Building(this, {
            name: 'ControlCabin',
            position: new THREE.Vector3(-60, 0, -90),
            width: 30.0,
            height: 5.5,
            depth: 12.0
        }));
    }

    /**
     * 数字孪生全局状态更新，分发至子组件
     */
    update() {
        if (this.ground && this.ground.update) {
            this.ground.update();
        }
        this.buildings.forEach(b => {
            if (b.update) b.update();
        });
    }
}
