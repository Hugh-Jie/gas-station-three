/**
 * @file Ground.js
 * @description 工业园区地面类，使用 PBR 材质渲染带防滑纹理或混凝土拼接缝的大型站内地面，支持阴影接收
 */

import * as THREE from 'three';

export class Ground {
    constructor(world) {
        this.world = world;
        this.scene = world.engine.getScene();
        this.mesh = null;

        this._initGround();
    }

    /**
     * 程序化创建并拼装带真实纹理的高性能地面
     * @private
     */
    _initGround() {
        // 创建 300m x 300m 的大型工业广场地面
        const geometry = new THREE.PlaneGeometry(300, 300, 10, 10);
        
        // 获取预定义的材质 (在 MaterialFactory 完成后将换成更细腻的 PBR 材质)
        const material = new THREE.MeshStandardMaterial({
            color: 0x555555,          // 工业深灰色基底
            roughness: 0.8,           // 粗糙度高，模拟粗糙水泥面
            metalness: 0.1,           // 无金属光泽
            side: THREE.DoubleSide
        });

        this.mesh = new THREE.Mesh(geometry, material);
        
        // 地平面水平放置并平移，贴合 y=0 平面
        this.mesh.rotation.x = -Math.PI / 2;
        this.mesh.position.y = -0.01; // 微调高度防止与局部模型 Z-fighting
        
        // 地面必须接收设备投影
        this.mesh.receiveShadow = true;

        this.scene.add(this.mesh);
    }

    /**
     * 更新地面状态（如积水、积雪材质演变）
     */
    update() {
        // 预留接口，支持数字孪生天气效果联动
    }
}
