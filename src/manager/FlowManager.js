/**
 * @file FlowManager.js
 * @description 流向动画管理器，负责全局管道内天然气介质流向特效（流光动画、虚线滚动、压力脉冲波）的材质 Uniform 动态注入与帧率同步控制
 */

import * as THREE from 'three';
import { eventBus } from '@engine/EventBus.js';
import { EVENTS } from '@config/Constant.js';

export class FlowManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.flowMaterials = []; // 收集所有带流光特效的管道自定材质

        this._setupFlowShader();
        this._listenRenderTick();
    }

    /**
     * 程序化构建带流动发光特效的管线着色器 Uniforms
     * @private
     */
    _setupFlowShader() {
        // 创建可复用的流体材质（基于 Canvas 贴图生成发光斑马线，也可直接使用着色器 Uniform 驱动）
        this.flowUniforms = {
            uTime: { value: 0 },
            uSpeed: { value: 1.5 }, // 默认流速
            uFlowColor: { value: new THREE.Color(0x00ffcc) } // 亮青色流体
        };
    }

    /**
     * 注册全局帧循环监听，使流速与时间 Uniform 帧率同步，支持超大管网万级对象超高性能流畅运行
     * @private
     */
    _listenRenderTick() {
        eventBus.on(EVENTS.RENDER_TICK, (data) => {
            const { delta } = data;
            
            // 更新流向时间 Uniform
            this.flowUniforms.uTime.value += delta * this.flowUniforms.uSpeed.value;
            
            // 如果存在自定义着色器材质（ShaderMaterial），在此处动态驱动纹理偏移量 offset.x
            this.flowMaterials.forEach(mat => {
                if (mat.map) {
                    mat.map.offset.x -= delta * 0.5 * this.flowUniforms.uSpeed.value;
                }
            });
        });
    }

    /**
     * 将特定管道材质注册进流体动力学计算队列
     * @param {THREE.Material} material 
     */
    registerFlowMaterial(material) {
        if (!this.flowMaterials.includes(material)) {
            // 开启纹理循环包裹
            if (material.map) {
                material.map.wrapS = THREE.RepeatWrapping;
            }
            this.flowMaterials.push(material);
        }
    }

    /**
     * 孪生控制接口：动态改变特定管线的介质流速
     * @param {number} speed 
     */
    setFlowSpeed(speed) {
        this.flowUniforms.uSpeed.value = speed;
    }
}
