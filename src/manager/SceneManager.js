/**
 * @file SceneManager.js
 * @description 数字化场站建站管理器，自适应读取 station.json 配置，循环实例化各类型工业设备（BallValve、Filter、Separator等），并调用 PipelineManager 自动拉设自适应工艺管网
 */

import * as THREE from 'three';
import { BallValve } from '@world/../equipment/BallValve.js';
import { GateValve } from '@world/../equipment/GateValve.js';
import { CheckValve } from '@world/../equipment/CheckValve.js';
import { ButterflyValve } from '@world/../equipment/ButterflyValve.js';
import { Filter } from '@world/../equipment/Filter.js';
import { Regulator } from '@world/../equipment/Regulator.js';
import { FlowMeter } from '@world/../equipment/FlowMeter.js';
import { Separator } from '@world/../equipment/Separator.js';
import { Compressor } from '@world/../equipment/Compressor.js';
import { Pump } from '@world/../equipment/Pump.js';
import { VentPipe } from '@world/../equipment/VentPipe.js';
import { ControlCabinet } from '@world/../equipment/ControlCabinet.js';
import { Platform } from '@world/../equipment/Platform.js';
import { PipelineManager } from './PipelineManager.js';

export class SceneManager {
    constructor(world) {
        this.world = world;
        this.scene = world.engine.getScene();
        this.pipelineManager = new PipelineManager(world);
        
        this.equipmentsMap = new Map(); // 存储已生成的设备实例，供管线连通查询
    }

    /**
     * 读取 station.json 全景数据并全自动生成三维物理数字孪生场站
     * @param {Object} stationData json 配置对象
     */
    buildStation(stationData) {
        if (!stationData) return;

        // 1. 程序化循环装配所有离散工业设备
        if (stationData.equipments) {
            stationData.equipments.forEach(eq => {
                const pos = new THREE.Vector3(eq.position[0], eq.position[1], eq.position[2]);
                const rot = new THREE.Euler(eq.rotation[0], eq.rotation[1], eq.rotation[2]);
                
                let instance = null;
                const options = {
                    id: eq.id,
                    position: pos,
                    rotation: rot,
                    dn: eq.dn || 300,
                    ...eq.properties
                };

                switch (eq.type) {
                    case 'BallValve':
                        instance = new BallValve(this.world, options);
                        break;
                    case 'GateValve':
                        instance = new GateValve(this.world, options);
                        break;
                    case 'CheckValve':
                        instance = new CheckValve(this.world, options);
                        break;
                    case 'ButterflyValve':
                        instance = new ButterflyValve(this.world, options);
                        break;
                    case 'Filter':
                        instance = new Filter(this.world, options);
                        break;
                    case 'Regulator':
                        instance = new Regulator(this.world, options);
                        break;
                    case 'FlowMeter':
                        instance = new FlowMeter(this.world, options);
                        break;
                    case 'Separator':
                        instance = new Separator(this.world, options);
                        break;
                    case 'Compressor':
                        instance = new Compressor(this.world, options);
                        break;
                    case 'Pump':
                        instance = new Pump(this.world, options);
                        break;
                    case 'VentPipe':
                        instance = new VentPipe(this.world, options);
                        break;
                    case 'ControlCabinet':
                        instance = new ControlCabinet(this.world, options);
                        break;
                    case 'Platform':
                        instance = new Platform(this.world, {
                            position: pos,
                            rotation: rot,
                            width: eq.width,
                            length: eq.length,
                            height: eq.height
                        });
                        break;
                    default:
                        console.warn(`未知的设备类型: ${eq.type}`);
                }

                if (instance) {
                    this.equipmentsMap.set(eq.id, instance);
                }
            });
        }

        // 2. 循环建立数据驱动的自适应工艺连通管网
        if (stationData.pipelines) {
            stationData.pipelines.forEach(line => {
                const fromEq = this.equipmentsMap.get(line.from);
                const toEq = this.equipmentsMap.get(line.to);

                if (fromEq && toEq) {
                    // 获取两端设备在场景中的三维网格组进行连接
                    const fromMesh = fromEq.group || fromEq.mesh;
                    const toMesh = toEq.group || toEq.mesh;
                    
                    if (fromMesh && toMesh) {
                        this.pipelineManager.connect(fromMesh, toMesh, line.dn);
                    }
                } else {
                    console.error(`无法连接管线，找不到起点或终点设备: ${line.from} -> ${line.to}`);
                }
            });
        }
    }
}
