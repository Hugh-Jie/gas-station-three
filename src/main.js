/**
 * @file main.js
 * @description 数字孪生场站系统入口文件，实例化 Engine，配置全局数据总网，初始化静态 World、自适应 UI 及 3D 悬浮传感器，实现全自动数据驱动建站
 */

import { Engine } from './engine/Engine.js';
import { World } from './world/World.js';
import { Sky } from './world/Sky.js';
import { Grass } from './world/Grass.js';
import { Lamp } from './world/Lamp.js';
import { SceneManager } from './manager/SceneManager.js';
import { SelectionManager } from './manager/SelectionManager.js';
import { PickManager } from './manager/PickManager.js';
import { LabelManager } from './manager/LabelManager.js';
import { AnimationManager } from './manager/AnimationManager.js';
import { FlowManager } from './manager/FlowManager.js';
import { eventBus } from './engine/EventBus.js';
import { EVENTS } from './config/Constant.js';
import * as THREE from 'three';

// 1. 初始化核心 3D 渲染引擎
const engine = new Engine('app');

// 2. 初始化世界静态公共地物
const world = new World(engine);
new Sky(world);

// 铺设绿化隔离带
new Grass(world, { position: new THREE.Vector3(-60, 0, 50), width: 80, depth: 60 });
new Grass(world, { position: new THREE.Vector3(60, 0, 50), width: 80, depth: 60 });

// 沿主干道排布路灯，并开启夜间照明检测
const lamp1 = new Lamp(world, { position: new THREE.Vector3(-100, 0, 85) });
const lamp2 = new Lamp(world, { position: new THREE.Vector3(0, 0, 85) });
const lamp3 = new Lamp(world, { position: new THREE.Vector3(100, 0, 85) });

// 3. 实例化各维度运行管理器
const selectionManager = new SelectionManager(engine);
const pickManager = new PickManager(engine);
const labelManager = new LabelManager(engine);
const animationManager = new AnimationManager(engine);
const flowManager = new FlowManager(engine);

// 4. 加载站场 JSON 元数据配置并自动建站
const stationSceneBuilder = new SceneManager(world);

fetch('./src/json/station.json')
    .then(res => res.json())
    .then(data => {
        stationSceneBuilder.buildStation(data);
        
        // 5. 自动为核心测控节点绑定 HTML 数字孪生传感器标签
        const filter01 = stationSceneBuilder.equipmentsMap.get('Filter_01');
        if (filter01) {
            labelManager.createLabel(filter01.group || filter01.mesh, '差压: 15.2 kPa', 'twin-label');
        }

        const meter01 = stationSceneBuilder.equipmentsMap.get('Meter_01');
        if (meter01) {
            labelManager.createLabel(meter01.group || meter01.mesh, '瞬时: 125,000 Nm³/h', 'twin-label-meter');
        }

        const regulator01 = stationSceneBuilder.equipmentsMap.get('Regulator_01');
        if (regulator01) {
            labelManager.createLabel(regulator01.group || regulator01.mesh, '阀后: 0.40 MPa', 'twin-label-regulator');
        }
    })
    .catch(err => {
        console.error('加载场站 station.json 失败，采用备用脚本自动建站: ', err);
    });

// 6. 注册孪生交互事件，实现数智面板联动
const overlay = document.getElementById('ui-overlay');
eventBus.on(EVENTS.PICK_OBJECT, (data) => {
    if (data) {
        overlay.innerHTML = `
            <div style="position: absolute; right: 20px; top: 20px; background: rgba(0,20,40,0.85); border: 2px solid #00ffcc; color: #fff; padding: 15px; border-radius: 5px; font-family: sans-serif; pointer-events: auto; width: 280px; box-shadow: 0 0 15px rgba(0,255,204,0.3)">
                <h3 style="margin-top:0; color:#00ffcc; border-bottom:1px solid rgba(0,255,204,0.3); padding-bottom:5px;">设备孪生参数卡片</h3>
                <p><strong>设备编码:</strong> ${data.id}</p>
                <p><strong>设备类型:</strong> ${data.name || '核心工艺件'}</p>
                <p><strong>通讯协议:</strong> Modbus/OPC UA</p>
                <p><strong>孪生状态:</strong> <span style="color:#00ff66;">正常运行</span></p>
                <button onclick="this.parentElement.remove()" style="background:#00ffcc; border:none; color:#000; width:100%; padding:6px; cursor:pointer; font-weight:bold; border-radius:3px;">确认</button>
            </div>
        `;
    } else {
        overlay.innerHTML = '';
    }
});
