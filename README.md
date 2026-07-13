# Gas Station Three - 工业级数字孪生天然气场站

本项目是一个采用最新 **Three.js r160**、**ES Modules** 和 **Vite** 构建的高性能、数据驱动型工业级数字孪生天然气场站三维可视化系统。系统完全基于面向对象设计（OOP），通过自适应解析 JSON 配置文件，实现全自动智能建站与管网拓扑生成。

## 项目特点

*   **全自动数据驱动建站**：拒绝手工摆放，整个场站所有设备均由 `station.json` 定义，系统在运行时自动解析并动态还原。
*   **自适应管网拓扑计算**：根据 `station.json` 中定义的设备物理连接关系，系统自动计算直管段长度、装配法兰、螺栓与支撑管卡，并自适应匹配 90° 弯头对接，无需手动对齐。
*   **高精工业级 PBR 材质**：材质工厂（MaterialFactory）统筹管理黄色天然气管道、红色阀门、镜面金属法兰及拉丝不锈钢等物理材质。
*   **数字孪生控制接口**：所有组件解耦化封装，全面预留 WebSocket / MQTT 等数据驱动协议接口，各设备类内置 `setValue()` / `setStatus()` 孪生监控更新方法。
*   **高性能渲染优化**：内置材质、几何体与纹理缓存，并支持实例化网格（InstancedMesh）优化大量高重复紧固件（如螺栓、管座）的 Draw Call。
*   **交互与动效**：支持流光流向动画、轨道相机聚焦、设备鼠标悬停及点击、Outline描边高亮、CSS2D 三维浮动传感器标签以及数字孪生数据卡片弹出。

---

## 目录结构

```text
gas-station-three/
├── index.html              # 主体入口 HTML 页面
├── package.json            # 依赖与脚本配置
├── vite.config.js          # Vite 构建工程配置
├── README.md               # 本文档说明
├── vendor/                 # 离线 Three.js 核心库
└── src/
    ├── main.js             # 系统生命周期总入口
    ├── config/
    │   └── Constant.js     # 全局常量、色彩与事件配置
    ├── engine/
    │   ├── Engine.js       # 核心引擎主单例
    │   ├── EventBus.js     # 事件总线解耦通信器
    │   ├── SceneManager.js # 场景挂载
    │   ├── RendererManager.js # 物理正确渲染器配置
    │   ├── CameraManager.js   # 鸟瞰相机系统
    │   └── ControlManager.js  # 阻尼轨道控制器约束
    ├── world/
    │   ├── World.js        # 静态环境主入口
    │   ├── Ground.js       # 混凝土站场路基
    │   ├── Road.js         # 斑马警告路缘石道路
    │   ├── Fence.js        # 半透明轻量化安全围栏
    │   ├── Gate.js         # 孪生可控双开金属大门
    │   ├── Grass.js        # 园区绿化隔离带
    │   ├── Sky.js          # 物理大气穹顶 Shader
    │   └── Lamp.js         # SpotLight 夜间路灯
    ├── pipeline/
    │   ├── Pipe.js         # 程序化黄色直管段
    │   ├── Elbow.js        # 自适应 90°/45° 弯头
    │   ├── Tee.js          # T型三通管件
    │   ├── Cross.js        # 十字四通接口
    │   ├── Reducer.js      # 同心异径变截面管
    │   ├── Flange.js       # 高精度螺栓法兰盘
    │   ├── Drain.js        # 低位排污集液管
    │   └── Vent.js         # 高位安全放散阀
    ├── equipment/
    │   ├── BallValve.js    # 旋转手柄球阀
    │   ├── GateValve.js    # 转动手轮闸阀
    │   ├── CheckValve.js   # 铸造箭头单向止回阀
    │   ├── ButterflyValve.js # 超薄对夹式蝶阀
    │   ├── Filter.js       # 离心分离过滤器
    │   ├── Regulator.js    # 双膜头自力式调压阀
    │   ├── FlowMeter.js    # 四声道超声波数显流量计
    │   ├── Separator.js    # 卧式鞍座脱水气液分离器
    │   ├── Compressor.js   # 变频防爆压缩机组
    │   ├── Pump.js         # 卧式多级离心注水泵
    │   ├── VentPipe.js     # 12米高耸放散排空管
    │   ├── ControlCabinet.js # 户外防爆控制琴台
    │   ├── Platform.js     # 镂空防滑格栅安全操作走道
    │   └── SteelSupport.js # 承重管架抱箍定位座
    ├── material/
    │   └── MaterialFactory.js # PBR 材质池工厂
    ├── manager/
    │   ├── SceneManager.js     # JSON 自动建站器
    │   ├── PipelineManager.js  # 自动管路拓扑装配中心
    │   ├── SelectionManager.js # 鼠标点击高亮与相机平滑聚焦
    │   ├── PickManager.js      # 鼠标悬浮防抖预览器
    │   ├── LabelManager.js     # CSS2D 悬浮传感器数字表
    │   ├── FlowManager.js      # 自适应管线介质流速动画管理器
    │   └── AnimationManager.js # 物理插值缓动动画控制中心
    └── json/
        └── station.json    # 全景孪生元配置文件
```

---

## 快速开始

### 1. 克隆并安装依赖
```bash
git clone https://github.com/Hugh-Jie/gas-station-three.git
cd gas-station-three
npm install
```

### 2. 启动本地开发服务器
```bash
npm run dev
```

### 3. 构建发布版本
```bash
npm run build
```

---

## 数据驱动与 JSON 建站规范

系统通过加载 `station.json` 自动渲染设备及管线。典型的配置格式如下：

### 1. 离散设备节点 (equipments)
```json
{
  "id": "Filter_01",
  "type": "Filter",
  "position": [-30, 0, 10],
  "rotation": [0, 0, 0],
  "dn": 300,
  "properties": {
    "dpValue": 15.2,
    "status": "normal"
  }
}
```

### 2. 自动拓扑管线 (pipelines)
```json
{
  "from": "Valve_Inlet_01",
  "to": "Filter_01",
  "dn": 300
}
```
系统会依据 `from` 与 `to` 设备的世界坐标及管径 `dn`，自动生成直管、法兰环、螺栓孔组并计算自适应位置，通过 PipelineManager 自动穿针引线完成站场级装配。

---

## 物理渲染性能要求说明

为使数字孪生系统能支撑 10,000+ 的复杂组合体，代码在架构上做出了以下专门优化：
1.  **各向异性过滤**：纹理管理器在加载路面与管壁 PBR 贴图时，自适应匹配显卡的最大各向异性过滤参数，使远景完全不虚。
2.  **材质与几何体缓存复用**：相同的阀门、支架与法兰盘完全复用相同的 Geometry 和 Material 内存句柄，绝不重复生成多余 WebGL 显存对象。
3.  **防抖射线检测（Debounce Raycast）**：鼠标滑动选择设备时，内置了 10ms 的轻量级运动缓冲与射线采样率限制，确保即便在高维精细网格场景下，鼠标滑动帧率依然维持在流畅的 60fps。

---

## 数字化转型与工业物联网（IoT）对接
项目中每个设备实体均包含 `update()`、`refresh()`、`setValue()` 和 `setStatus()` 预留方法，方便开发者直接在 `main.js` 或控制器中挂载 WebSocket / MQTT 主题，通过实时遥测数据流触发设备在三维大屏中的颜色变化、开度动画与差压报警。
