/**
 * @file ResizeManager.js
 * @description 视口调整管理器，自动监听并计算窗口大小变化，同步更新渲染器尺寸与相机投影矩阵
 */

import { EVENTS } from '@config/Constant.js';
import { eventBus } from './EventBus.js';

export class ResizeManager {
    constructor(engine) {
        this.engine = engine;
        this.container = engine.container;

        this._setupResizeListener();
    }

    /**
     * 设置视口尺寸变化监听器
     * @private
     */
    _setupResizeListener() {
        window.addEventListener('resize', () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            // 1. 同步更新相机长宽比与投影矩阵
            if (this.engine.cameraManager) {
                this.engine.cameraManager.resize(width, height);
            }

            // 2. 同步更新渲染器像素尺寸
            if (this.engine.rendererManager) {
                this.engine.rendererManager.resize(width, height);
            }

            // 3. 广播全局视口改变事件，以便其他 UI 或后期处理层感知
            eventBus.emit(EVENTS.RESIZE, { width, height });
        });
    }
}
