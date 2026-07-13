/**
 * @file SceneManager.js
 * @description 数字孪生站场场景管理器。负责解析 JSON (station.json) 场站配置文件，实现全站设备的动态自适应加载、管线高保真自动化连接与对齐、地面与建筑地物整体初始化排布
 */

import * as THREE from 'three';
import { World } from '../world/World.js';

// 动态载入 Pipeline 与 Equipment 库以供 JSON 实例化使用
import { Pipe } from '../pipeline/Pipe.js';
import { Elbow } from '../pipeline/Elbow.js';
import { Tee } from '../pipeline/Tee.js';
import { Cross } from '../pipeline/Cross.js';
import { Reducer } from '../pipeline/Reducer.js';
import { Flange } from '../pipeline/Flange.js';
import { Base } from '../pipeline/Base.js';
import { Drain } from '../pipeline/Drain.js';
import { Vent } from '../pipeline/Vent.js';

import { BallValve } from '../equipment/BallValve.js';
import { GateValve } from '../equipment/GateValve.js';
import { CheckValve } from '../equipment/CheckValve.js';
import { ButterflyValve } from '../equipment/ButterflyValve.js';
import { Filter } from '../equipment/Filter.js';
import { Regulator } from '../equipment/Regulator.js';
import { FlowMeter } from '../equipment/FlowMeter.js';
import { PressureGauge } from '../equipment/PressureGauge.js';
import { TemperatureGauge } from '../equipment/TemperatureGauge.js';
import { Separator } from '../equipment/Separator.js';
import { Compressor } from '../equipment/Compressor.js';
import { Pump } from '../equipment/Pump.js';
import { VentPipe } from '../equipment/VentPipe.js';
import { ControlCabinet } from '../equipment/ControlCabinet.js';
import { Platform } from '../equipment/Platform.js';
import { SteelSupport } from '../equipment/SteelSupport.js';

export class SceneManager {
    constructor(world) {
        this.world = world;
        this.scene = world.engine.getScene();

        // 注册实例化映射表
        this.classRegistry = {
            // 管路组件
            Pipe, Elbow, Tee, Cross, Reducer, Flange, Base, Drain, Vent,
            // 生产与辅助设备
            BallValve, GateValve, CheckValve, ButterflyValve, Filter, Regulator,
            FlowMeter, PressureGauge, TemperatureGauge, Separator, Compressor,
            Pump, VentPipe, ControlCabinet, Platform, SteelSupport
        };

        this.equipments = [];
        this.pipelines = [];
    }

    /**
     * 异步加载并解析站场配置文件进行场景动态重构
     * @param {string} url JSON配置文件URL路径
     */
    async loadStation(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load station config: ${response.statusText}`);
            const config = await response.json();
            
            this.buildStation(config);
        } catch (error) {
            console.error('Error rendering station layout:', error);
        }
    }

    /**
     * 解析配置数据并实例化对象
     * @param {Object} data 
     */
    buildStation(data) {
        console.log(`[SceneManager] Start building digital twin station: ${data.stationName || 'Default Station'}`);

        // 1. 初始化场景环境基底地物 (地面、道路、建筑围栏、路灯)
        if (data.environment) {
            this.world.initEnvironment(data.environment);
        }

        // 2. 参数化构建各工艺流程设备组件
        if (data.equipments && Array.isArray(data.equipments)) {
            data.equipments.forEach(eqConfig => {
                const ClassRef = this.classRegistry[eqConfig.type];
                if (ClassRef) {
                    const options = this._parseOptions(eqConfig);
                    const instance = new ClassRef(this.world, options);
                    this.equipments.push(instance);
                } else {
                    console.warn(`[SceneManager] Unregistered class type: ${eqConfig.type}`);
                }
            });
        }

        // 3. 自动化连接及自适应拟合工艺管道 network
        if (data.pipelines && Array.isArray(data.pipelines)) {
            data.pipelines.forEach(pipeConfig => {
                const ClassRef = this.classRegistry[pipeConfig.type || 'Pipe'];
                if (ClassRef) {
                    const options = this._parseOptions(pipeConfig);
                    const instance = new ClassRef(this.world, options);
                    this.pipelines.push(instance);
                }
            });
        }

        console.log(`[SceneManager] Construction complete! Loaded ${this.equipments.length} equipments and ${this.pipelines.length} pipeline networks.`);
    }

    /**
     * 配置项转换：将 JSON 中的平直数组坐标 [x, y, z] 转换为 Three.js 的 Vector3/Euler 实例
     * @private
     */
    _parseOptions(config) {
        const options = { ...config.options };

        if (options.position && Array.isArray(options.position)) {
            options.position = new THREE.Vector3(...options.position);
        }
        if (options.rotation && Array.isArray(options.rotation)) {
            options.rotation = new THREE.Euler(
                THREE.MathUtils.degToRad(options.rotation[0]),
                THREE.MathUtils.degToRad(options.rotation[1]),
                THREE.MathUtils.degToRad(options.rotation[2])
            );
        }
        if (options.start && Array.isArray(options.start)) {
            options.start = new THREE.Vector3(...options.start);
        }
        if (options.end && Array.isArray(options.end)) {
            options.end = new THREE.Vector3(...options.end);
        }
        if (options.direction && Array.isArray(options.direction)) {
            options.direction = new THREE.Vector3(...options.direction);
        }

        options.id = config.id;
        return options;
    }

    /**
     * 孪生联动：通过设备 ID 获取孪生对象，实时动态修改其工况工艺参数（如压力、温度、流量计数字）
     * @param {string} id 设备ID
     * @returns {Object|null}
     */
    getEquipmentById(id) {
        return this.equipments.find(eq => eq.id === id) || null;
    }

    /**
     * 周期更新：执行孪生设备的动态动画逻辑（如气流粒子、仪表指针微颤、累计流量累加等）
     */
    update() {
        this.equipments.forEach(eq => {
            if (typeof eq.update === 'function') {
                eq.update();
            }
        });
    }
}
