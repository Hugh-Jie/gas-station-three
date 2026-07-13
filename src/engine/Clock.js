/**
 * @file Clock.js
 * @description 时钟管理组件，对 Three.js 的 Clock 进行工业级封装，提供秒级帧率限制与高精度孪生运行累计时间计算
 */

import * as THREE from 'three';

export class Clock {
    constructor() {
        this.clock = new THREE.Clock();
        this.accumulatedTime = 0; // 数字孪生累计运行时长（秒）
    }

    /**
     * 启动或重置时钟
     */
    start() {
        this.clock.start();
        this.accumulatedTime = 0;
    }

    /**
     * 在每一帧获取时间增量，并累加运行时间
     * @returns {Object} { delta: number, elapsed: number }
     */
    tick() {
        const delta = this.clock.getDelta();
        // 限制单帧最大时间间隔，防止后台切回后大跨度插值导致物理穿透与拉扯
        const clampedDelta = Math.min(delta, 0.1);
        
        this.accumulatedTime += clampedDelta;

        return {
            delta: clampedDelta,
            elapsed: this.accumulatedTime
        };
    }
}
