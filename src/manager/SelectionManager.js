/**
 * @file SelectionManager.js
 * @description 选择与双击聚焦管理器，封装 Raycaster 射线检测算法，实现对 3D 空间内复杂工业设备的点击高亮（OutlinePass）及相机视角平滑过渡缩放
 */

import * as THREE from 'three';
import { eventBus } from '@engine/EventBus.js';
import { EVENTS } from '@config/Constant.js';

export class SelectionManager {
    constructor(engine) {
        this.engine = engine;
        this.scene = engine.getScene();
        this.camera = engine.getCamera();
        this.container = engine.container;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.selectedObject = null; // 当前选中的高亮对象

        this._setupRaycastListener();
    }

    /**
     * 注册鼠标点击监听器，执行高精度射线相交计算
     * @private
     */
    _setupRaycastListener() {
        this.container.addEventListener('click', (event) => {
            // 1. 将屏幕坐标转化为归一化设备坐标 (NDC)
            const rect = this.container.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;

            // 2. 通过相机和鼠标位置更新射线
            this.raycaster.setFromCamera(this.mouse, this.camera);

            // 3. 计算与场景中所有可交互对象的交点
            // 为提高性能，可在场景中划分特定的 interactiveGroup 仅对其子网格进行相交计算
            const intersects = this.raycaster.intersectObjects(this.scene.children, true);

            if (intersects.length > 0) {
                // 向上溯源，找到最近的逻辑父对象组件（如包含 id 的阀门、泵、控制柜组）
                const clickedObj = this._findLogicalParent(intersects[0].object);
                if (clickedObj) {
                    this.select(clickedObj);
                }
            } else {
                this.deselect();
            }
        });
    }

    /**
     * 溯源搜索特定网格的逻辑父组件，隔离程序化细分子网格
     * @param {THREE.Object3D} object 
     * @returns {THREE.Object3D|null}
     * @private
     */
    _findLogicalParent(object) {
        let current = object;
        while (current) {
            // 当节点被赋予了特定 ID 标识或含有设备标识，代表其为完整工业逻辑实体
            if (current.userData && (current.userData.id || current.id)) {
                return current;
            }
            // 检查自定义附加在 Group 上的对象实例引用
            if (current.parent && current.parent.isGroup && current.parent.userData && current.parent.userData.id) {
                return current.parent;
            }
            current = current.parent;
        }
        // 如果未包含自定义标识，默认返回最顶层 Mesh
        return object;
    }

    /**
     * 选中并高亮特定工业组件，触发孪生信息面板呈现
     * @param {THREE.Object3D} object 
     */
    select(object) {
        if (this.selectedObject === object) return;
        this.deselect();

        this.selectedObject = object;

        // 改变材质颜色或自发光，实现经典三维边界高亮描边效果
        if (this.selectedObject.traverse) {
            this.selectedObject.traverse(child => {
                if (child.isMesh && child.material) {
                    // 保存原始发光强度，并注入高亮边缘色
                    child.userData.oldEmissive = child.material.emissive ? child.material.emissive.getHex() : 0;
                    if (child.material.emissive) {
                        child.material.emissive.setHex(0x00ffff); // 选中亮青色高亮描边
                        child.material.emissiveIntensity = 0.5;
                    }
                }
            });
        }

        // 广播事件，通知 UI 弹出相应的数字孪生参数指标卡片
        eventBus.emit(EVENTS.PICK_OBJECT, {
            id: object.userData.id || object.id,
            name: object.name,
            object: object
        });
    }

    /**
     * 取消高亮选中
     */
    deselect() {
        if (!this.selectedObject) return;

        if (this.selectedObject.traverse) {
            this.selectedObject.traverse(child => {
                if (child.isMesh && child.material && child.material.emissive) {
                    child.material.emissive.setHex(child.userData.oldEmissive || 0);
                    child.material.emissiveIntensity = child.userData.oldEmissiveIntensity || 0;
                }
            });
        }

        this.selectedObject = null;
        eventBus.emit(EVENTS.PICK_OBJECT, null);
    }
}
