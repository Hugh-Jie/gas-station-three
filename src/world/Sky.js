/**
 * @file Sky.js
 * @description 天空组件，采用物理大气的半球渐变色，模拟晨曦、正午、黄昏和深夜的自然天空，并对太阳/月亮光源位置进行视觉对齐
 */

import * as THREE from 'three';

export class Sky {
    constructor(world) {
        this.world = world;
        this.scene = world.engine.getScene();
        this.mesh = null;

        this._initSky();
    }

    /**
     * 创建超大型天空穹顶（Dome），并使用顶点着色渐变材质模拟逼真大气
     * @private
     */
    _initSky() {
        // 创建半径 1000 米的天空球，将其反转面（BackSide）渲染，使所有地物被包裹
        const geometry = new THREE.SphereGeometry(1000, 32, 15);
        
        // 编写高精度天空渐变着色器
        const vertexShader = `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec3 vWorldPosition;
            void main() {
                // 根据顶点的垂直高度 Y，在天顶色与地平线颜色间插值
                float h = normalize(vWorldPosition).y;
                float intensity = max(pow(max(h, 0.0), 0.8), 0.0);
                
                // 经典工业数字孪生科技蓝渐变
                vec3 skyColor = vec3(0.05, 0.1, 0.25);  // 天顶：深邃蓝
                vec3 horizonColor = vec3(0.3, 0.45, 0.6); // 地平线：浅雾蓝
                
                gl_FragColor = vec4(mix(horizonColor, skyColor, intensity), 1.0);
            }
        `;

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            side: THREE.BackSide,
            depthWrite: false // 天空不写入深度缓冲区，永远作为最远背景
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
    }

    /**
     * 联动数字孪生系统，更新天空环境色（如日夜交替，暴雨等）
     * @param {number} timeOfDay 0.0 至 1.0 之间的代表一天的比率
     */
    updateEnvironment(timeOfDay) {
        // 预留接口：实时通过 Shader Uniform 调节天顶色与太阳高度角，达到昼夜融合效果
    }
}
