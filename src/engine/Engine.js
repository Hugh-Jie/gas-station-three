/**
 * @file Engine.js
 * @description 核心引擎类，负责协调所有管理模块。采用单例模式。
 */

import * as THREE from 'three';
import { ENGINE_CONFIG, EVENTS } from '@config/Constant.js';
import { eventBus } from './EventBus.js';
import { SceneManager } from './SceneManager.js';
import { RendererManager } from './RendererManager.js';
import { CameraManager } from './CameraManager.js';
import { ControlManager } from './ControlManager.js';
import { LightManager } from './LightManager.js';
import { ResizeManager } from './ResizeManager.js';

export class Engine {
    static instance;

    constructor(containerId) {
        if (Engine.instance) return Engine.instance;
        Engine.instance = this;

        this.container = document.getElementById(containerId);
        this.clock = new THREE.Clock();
        
        this._init();
    }

    /**
     * 初始化引擎组件
     * @private
     */
    _init() {
        this.sceneManager = new SceneManager(this);
        this.rendererManager = new RendererManager(this);
        this.cameraManager = new CameraManager(this);
        this.controlManager = new ControlManager(this);
        this.lightManager = new LightManager(this);
        this.resizeManager = new ResizeManager(this);

        this._startLoop();
    }

    /**
     * 启动渲染循环
     * @private
     */
    _startLoop() {
        const animate = () => {
            const delta = this.clock.getDelta();
            const elapsed = this.clock.getElapsedTime();

            requestAnimationFrame(animate);

            if (this.controlManager) {
                this.controlManager.update(delta);
            }

            eventBus.emit(EVENTS.RENDER_TICK, { delta, elapsed });

            this.rendererManager.render(
                this.sceneManager.getScene(),
                this.cameraManager.getCamera()
            );
        };
        animate();
    }

    getScene() { return this.sceneManager.getScene(); }
    getCamera() { return this.cameraManager.getCamera(); }
    getRenderer() { return this.rendererManager.getRenderer(); }
}
