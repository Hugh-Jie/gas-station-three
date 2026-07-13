/**
 * @file PickManager.js
 * @description 3D 拾取与悬停事件管理器，结合 Raycaster 提供高频防抖悬停检测，动态触发 Tooltip 指针变动并高亮发光，增强数字孪生场景中的人机交互响应
 */

import * as THREE from 'three';
import { eventBus } from '@engine/EventBus.js';
import { EVENTS } from '@config/Constant.js';

export class PickManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.camera = engine.getCamera();
        this.container = engine.container;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredObject = null; // 当前悬停的对象

        this._setupHoverListener();
    }

    /**
     * 注册鼠标高频移动监听器，实现防抖工业级拾取高亮
     * @private
     */
    _setupHoverListener() {
        let timeoutId = null;

        this.container.addEventListener('mousemove', (event) => {
            // 1. 防抖（Debounce）处理，避免频繁射线计算导致画面卡顿
            if (timeoutId) clearTimeout(timeoutId);

            timeoutId = setTimeout(() => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
                this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

                this.raycaster.setFromCamera(this.mouse, this.camera);
                const intersects = this.raycaster.intersectObjects(this.scene.children, true);

                if (intersects.length > 0) {
                    const intersectedObj = this._findLogicalParent(intersects[0].object);
                    if (intersectedObj) {
                        this._onHoverStart(intersectedObj);
                        this.container.style.cursor = 'pointer'; // 指针变为手型
                    }
                } else {
                    this._onHoverEnd();
                    this.container.style.cursor = 'default';
                }
            }, 10); // 10ms 防抖
        });
    }

    /**
     * 向上搜索具有业务含义的组件父级
     * @private
     */
    _findLogicalParent(object) {
        let current = object;
        while (current) {
            if (current.userData && current.userData.id) {
                return current;
            }
            if (current.parent && current.parent.isGroup && current.parent.userData && current.parent.userData.id) {
                return current.parent;
            }
            current = current.parent;
        }
        return null;
    }

    /**
     * 当鼠标悬停在特定设备上方时触发
     * @private
     */
    _onHoverStart(object) {
        if (this.hoveredObject === object) return;
        this._onHoverEnd();

        this.hoveredObject = object;

        // 微调材质发光颜色，进行高亮预览
        this.hoveredObject.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                child.userData.preHoverEmissive = child.material.emissive.getHex();
                // 淡淡的黄绿色发光，代表可拾取
                child.material.emissive.setHex(0xbfff00);
                child.material.emissiveIntensity = 0.25;
            }
        });
    }

    /**
     * 鼠标移出设备时恢复材质
     * @private
     */
    _onHoverEnd() {
        if (!this.hoveredObject) return;

        this.hoveredObject.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                const prev = child.userData.preHoverEmissive !== undefined ? child.userData.preHoverEmissive : 0;
                child.material.emissive.setHex(prev);
                child.material.emissiveIntensity = 0;
            }
        });

        this.hoveredObject = null;
    }
}
