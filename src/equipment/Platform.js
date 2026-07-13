/**
 * @file Platform.js
 * @description 钢结构过桥、检修平台及双侧安全护栏组件，程序化生成高精度防滑花纹格栅板、踢脚板、多管防坠栏杆，并配置支撑立柱的物理混凝土定位基座
 */

import * as THREE from 'three';
import { MaterialFactory } from '@material/MaterialFactory.js';

export class Platform {
    constructor(world, options = {}) {
        this.world = world;
        this.scene = world.engine.getScene();

        this.position = options.position || new THREE.Vector3(0, 0, 0);
        this.rotation = options.rotation || new THREE.Euler(0, 0, 0);
        this.width = options.width || 3.0;   // 平台跨度宽度
        this.length = options.length || 5.0;  // 平台长度
        this.height = options.height || 1.5;  // 平台钢支撑离地高度

        this.group = new THREE.Group();
        this._initPlatform();
    }

    /**
     * 程序化构建带防滑栅格、踢脚板及安全扶手的工业走线检修平台
     * @private
     */
    _initPlatform() {
        const steelMat = MaterialFactory.getMaterial('steel_structure');
        const concreteMat = MaterialFactory.getMaterial('concrete_base');
        const flangeMat = MaterialFactory.getMaterial('flange_silver');

        // 1. 四角混凝土安装地基 (Four Foundation Pillars)
        const pillarGeom = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const pillarPositions = [
            [-this.width / 2 + 0.2, 0.2, -this.length / 2 + 0.2],
            [this.width / 2 - 0.2, 0.2, -this.length / 2 + 0.2],
            [-this.width / 2 + 0.2, 0.2, this.length / 2 - 0.2],
            [this.width / 2 - 0.2, 0.2, this.length / 2 - 0.2]
        ];

        pillarPositions.forEach(pos => {
            const pillar = new THREE.Mesh(pillarGeom, concreteMat);
            pillar.position.set(pos[0], pos[1], pos[2]);
            pillar.castShadow = true;
            pillar.receiveShadow = true;
            this.group.add(pillar);
        });

        // 2. 钢支撑承重框架立柱 (Four Steel Pillars)
        const columnGeom = new THREE.CylinderGeometry(0.05, 0.05, this.height, 8);
        pillarPositions.forEach(pos => {
            const col = new THREE.Mesh(columnGeom, steelMat);
            col.position.set(pos[0], 0.4 + this.height / 2, pos[2]);
            col.castShadow = true;
            col.receiveShadow = true;
            this.group.add(col);
        });

        // 3. 平台底框架大梁 (Platform Main Beams)
        const beamThickness = 0.06;
        const beamHeight = 0.15;
        
        // 纵向两梁
        const longBeamGeom = new THREE.BoxGeometry(beamThickness, beamHeight, this.length);
        const leftBeam = new THREE.Mesh(longBeamGeom, steelMat);
        leftBeam.position.set(-this.width / 2 + 0.03, 0.4 + this.height, 0);
        leftBeam.castShadow = true;
        this.group.add(leftBeam);

        const rightBeam = leftBeam.clone();
        rightBeam.position.x = this.width / 2 - 0.03;
        this.group.add(rightBeam);

        // 4. 防滑格栅踏板面 (Anti-slip Grating Platform Floor)
        const floorThickness = 0.03;
        const floorGeom = new THREE.BoxGeometry(this.width, floorThickness, this.length);
        
        // 程序化建立带镂空格栅物理效果的 Canvas 贴图
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#111111'; // 深灰色背景
        ctx.fillRect(0, 0, 32, 32);
        ctx.strokeStyle = '#666666'; // 钢条本色
        ctx.lineWidth = 2;
        // 绘制十字网格线
        ctx.beginPath();
        for (let i = 0; i <= 32; i += 8) {
            ctx.moveTo(i, 0); ctx.lineTo(i, 32);
            ctx.moveTo(0, i); ctx.lineTo(32, i);
        }
        ctx.stroke();

        const gridTex = new THREE.CanvasTexture(canvas);
        gridTex.wrapS = THREE.RepeatWrapping;
        gridTex.wrapT = THREE.RepeatWrapping;
        gridTex.repeat.set(this.width * 10, this.length * 10);

        const floorMat = new THREE.MeshStandardMaterial({
            map: gridTex,
            roughness: 0.5,
            metalness: 0.8
        });

        const floorMesh = new THREE.Mesh(floorGeom, floorMat);
        floorMesh.position.set(0, 0.4 + this.height + beamHeight / 2 + floorThickness / 2, 0);
        floorMesh.castShadow = true;
        floorMesh.receiveShadow = true;
        this.group.add(floorMesh);

        // 5. 安全隔离防护栏杆组 (Safety Handrails)
        const railHeight = 1.1; // 工业规范：安全护栏高 1.1 米
        this._buildPlatformHandrails(railHeight, flangeMat);

        // 6. 空间定位姿态应用
        this.group.position.copy(this.position);
        this.group.rotation.copy(this.rotation);

        this.scene.add(this.group);
    }

    /**
     * 程序化沿平台两侧排布两道安全金属护栏及防滑踢脚板
     * @private
     */
    _buildPlatformHandrails(railHeight, railMat) {
        const postGeom = new THREE.CylinderGeometry(0.015, 0.015, railHeight, 8);
        const barGeom = new THREE.CylinderGeometry(0.012, 0.012, this.length, 8);

        const frameY = 0.4 + this.height + 0.1; // 平台面高度基底

        // 左侧栏杆组
        const leftRailGroup = new THREE.Group();
        leftRailGroup.position.set(-this.width / 2 + 0.05, frameY, 0);

        // 栏杆立柱 (Posts)
        const postInterval = 1.25;
        const postCount = Math.floor(this.length / postInterval) + 1;
        const startZ = -((postCount - 1) * postInterval) / 2;

        for (let i = 0; i < postCount; i++) {
            const post = new THREE.Mesh(postGeom, railMat);
            post.position.set(0, railHeight / 2, startZ + i * postInterval);
            post.castShadow = true;
            leftRailGroup.add(post);
        }

        // 顶扶手面 (Top Rail)
        const topBar = new THREE.Mesh(barGeom, railMat);
        topBar.rotation.x = Math.PI / 2;
        topBar.position.set(0, railHeight, 0);
        topBar.castShadow = true;
        leftRailGroup.add(topBar);

        // 中间防护横杆 (Mid Rail)
        const midBar = topBar.clone();
        midBar.position.y = railHeight * 0.55;
        leftRailGroup.add(midBar);

        // 踢脚板 (Toe Board) - 100mm 踢脚板防止工具跌落
        const toeGeom = new THREE.BoxGeometry(0.01, 0.1, this.length);
        const toeMesh = new THREE.Mesh(toeGeom, MaterialFactory.getMaterial('steel_structure', { color: 0xffcc00 })); // 安全黄色踢脚板
        toeMesh.position.set(0, 0.05, 0);
        toeMesh.castShadow = true;
        leftRailGroup.add(toeMesh);

        this.group.add(leftRailGroup);

        // 右侧对称栏杆组
        const rightRailGroup = leftRailGroup.clone();
        rightRailGroup.position.x = this.width / 2 - 0.05;
        this.group.add(rightRailGroup);
    }
}
