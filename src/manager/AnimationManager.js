/**
 * @file AnimationManager.js
 * @description 全局动画管理器，提供基于三维贝塞尔曲线、线性插值的缓动计算，管理设备操作过渡（如阀门手柄缓缓旋转、水泵电机高频微振、压力指针阻尼偏转等）的运行时动画控制句柄
 */

import { eventBus } from '@engine/EventBus.js';
import { EVENTS } from '@config/Constant.js';

export class AnimationManager {
    constructor(engine) {
        this.engine = engine;
        this.animations = []; // 存储当前正在运行的动画实体

        this._listenRenderTick();
    }

    /**
     * 注册并启动一个属性动画（类似于 gsap 或 tween）
     * @param {Object} options 
     * @param {Object} options.target 动画目标对象
     * @param {string} options.property 属性链（如 "rotation.y"）
     * @param {number} options.to 目标终值
     * @param {number} [options.duration=1.0] 持续时间（秒）
     * @param {string} [options.easing='easeInOut'] 缓动函数
     * @param {Function} [options.onComplete] 动画完成回调
     */
    to(options) {
        const anim = {
            target: options.target,
            property: options.property,
            to: options.to,
            duration: options.duration || 1.0,
            elapsed: 0,
            from: this._getProperty(options.target, options.property),
            easing: options.easing || 'easeInOut',
            onComplete: options.onComplete || null
        };

        this.animations.push(anim);
    }

    /**
     * 获取指定属性链的值
     * @private
     */
    _getProperty(obj, propPath) {
        const props = propPath.split('.');
        let current = obj;
        for (const p of props) {
            current = current[p];
        }
        return current;
    }

    /**
     * 设定指定属性链的值
     * @private
     */
    _setProperty(obj, propPath, value) {
        const props = propPath.split('.');
        let current = obj;
        for (let i = 0; i < props.length - 1; i++) {
            current = current[props[i]];
        }
        current[props[props.length - 1]] = value;
    }

    /**
     * 监听核心帧循环，执行所有注册动画的时间增量和插值计算
     * @private
     */
    _listenRenderTick() {
        eventBus.on(EVENTS.RENDER_TICK, (data) => {
            const { delta } = data;
            
            for (let i = this.animations.length - 1; i >= 0; i--) {
                const anim = this.animations[i];
                anim.elapsed += delta;

                const progress = Math.min(anim.elapsed / anim.duration, 1.0);
                
                // 应用缓动计算
                const ratio = this._getEasingRatio(progress, anim.easing);
                const currentValue = anim.from + (anim.to - anim.from) * ratio;

                this._setProperty(anim.target, anim.property, currentValue);

                if (progress >= 1.0) {
                    if (anim.onComplete) anim.onComplete();
                    this.animations.splice(i, 1); // 销毁已完成动画
                }
            }
        });
    }

    /**
     * 常用工业缓动函数计算器
     * @private
     */
    _getEasingRatio(t, easing) {
        if (easing === 'linear') return t;
        if (easing === 'easeIn') return t * t;
        if (easing === 'easeOut') return t * (2 - t);
        // 默认 easeInOut
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
}
