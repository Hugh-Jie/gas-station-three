/**
 * @file EventBus.js
 * @description 全局事件总线，实现模块间的解耦通信
 */

export class EventBus {
    constructor() {
        this.events = {};
    }

    /**
     * 监听事件
     * @param {string} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);
    }

    /**
     * 移除监听
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        if (!this.events[eventName]) return;
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
    }

    /**
     * 触发事件
     * @param {string} eventName 
     * @param {any} data 
     */
    emit(eventName, data) {
        if (!this.events[eventName]) return;
        this.events[eventName].forEach(callback => {
            callback(data);
        });
    }
}

// 导出单例
export const eventBus = new EventBus();
