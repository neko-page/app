// selectors-data.js

// 基础选择器（@a, @p, @e 等）
const baseSelectors = [
    {
        code: "@a",
        name: "所有玩家",
        desc: "选择所有玩家。",
        example: "@a[name=Steve]",
        color: "#2196F3"
    },
    {
        code: "@p",
        name: "最近玩家",
        desc: "选择距离执行者最近的玩家。",
        example: "@p[r=10]",
        color: "#4CAF50"
    },
    {
        code: "@r",
        name: "随机玩家",
        desc: "选择随机一个玩家。",
        example: "@r[type=!Player]",
        color: "#FF9800"
    },
    {
        code: "@s",
        name: "执行者",
        desc: "选择执行该命令的实体（常用于命令方块或函数）。",
        example: "@s[tag=boss]",
        color: "#9C27B0"
    },
    {
        code: "@e",
        name: "所有实体",
        desc: "选择所有实体（包括玩家、生物、掉落物等）。",
        example: "@e[type=creeper]",
        color: "#F44336"
    },
    {
        code: "@initiator",
        name: "发起者",
        desc: "选择引发事件的实体（用于事件响应）。",
        example: "@initiator",
        color: "#00BCD4"
    }
];

// 选择器参数详解（hasitem, type, score 等）
const selectorParams = [
    {
        param: "type",
        name: "实体类型",
        syntax: "[type=<实体 ID>]",
        desc: "筛选特定类型的实体。可用实体 ID 如：zombie, creeper, player, item 等。",
        example: "@e[type=zombie]",
        negative: "@e[type=!zombie] (排除僵尸)",
        color: "#F44336"
    },
    {
        param: "r / rm",
        name: "半径范围",
        syntax: "[r=<最大半径>] [rm=<最小半径>]",
        desc: "r 为最大半径，rm 为最小半径。单位是方块。",
        example: "@p[r=10] (10 格内最近玩家)",
        negative: "@p[rm=5,r=10] (5-10 格之间的玩家)",
        color: "#2196F3"
    },
    {
        param: "name",
        name: "名称筛选",
        syntax: "[name=<玩家名>]",
        desc: "筛选特定名称的玩家或实体。",
        example: "@a[name=Steve]",
        negative: "@a[name=!Steve] (排除 Steve)",
        color: "#4CAF50"
    },
    {
        param: "tag",
        name: "标签筛选",
        syntax: "[tag=<标签名>]",
        desc: "筛选带有特定标签的实体。标签需用 /tag 命令添加。",
        example: "@e[tag=boss]",
        negative: "@e[tag=!boss] (排除带 boss 标签的)",
        color: "#9C27B0"
    },
    {
        param: "scores",
        name: "记分板分数",
        syntax: "[scores=<记分项>=<分数>]",
        desc: "筛选记分板分数符合条件的实体。支持范围如 1..10。",
        example: "@a[scores=kill=5] (kill 记分等于 5)",
        negative: "@a[scores=kill=1..] (kill 记分大于等于 1)",
        color: "#FF9800"
    },
    {
        param: "hasitem",
        name: "持有物品",
        syntax: "[hasitem={item=<物品 ID>,location=<槽位>}]",
        desc: "筛选持有特定物品的玩家。location: slot.hotbar(快捷栏), slot.inventory(背包), slot.armor(护甲)。",
        example: "@a[hasitem={item=diamond_sword,location=slot.hotbar}]",
        negative: "不支持负向筛选",
        color: "#FFC107"
    },
    {
        param: "family",
        name: "生物家族",
        syntax: "[family=<家族名>]",
        desc: "筛选特定家族的生物。如：mob, monster, animal, undead 等。",
        example: "@e[family=undead] (所有亡灵生物)",
        negative: "@e[family=!monster] (排除怪物)",
        color: "#8BC34A"
    },
    {
        param: "level",
        name: "经验等级",
        syntax: "[level=<等级>]",
        desc: "筛选玩家经验等级。支持范围如 10..30。",
        example: "@a[level=30] (30 级玩家)",
        negative: "@a[level=!1..10] (排除 1-10 级)",
        color: "#3F51B5"
    },
    {
        param: "m",
        name: "游戏模式",
        syntax: "[m=<模式>]",
        desc: "筛选特定游戏模式的玩家。0=生存，1=创造，2=冒险，5=旁观。",
        example: "@a[m=1] (所有创造模式玩家)",
        negative: "@a[m=!0] (排除生存模式)",
        color: "#E91E63"
    },
    {
        param: "c",
        name: "数量限制",
        syntax: "[c=<数量>]",
        desc: "限制选择的实体数量。负数表示从最远开始选。",
        example: "@p[c=3] (最近的 3 个玩家)",
        negative: "@r[c=-1] (最远的 1 个玩家)",
        color: "#00BCD4"
    },
    {
        param: "x / y / z",
        name: "坐标位置",
        syntax: "[x=<x> y=<y> z=<z>]",
        desc: "以特定坐标为中心进行选择，通常与 r 配合使用。",
        example: "@e[x=100,y=64,z=200,r=5]",
        negative: "不支持负向筛选",
        color: "#607D8B"
    },
    {
        param: "rx / rxm",
        name: "垂直旋转",
        syntax: "[rx=<最大>] [rxm=<最小>]",
        desc: "筛选玩家的垂直视角角度（-90 到 90）。",
        example: "@a[rx=0,rxm=-90] (看向下方的玩家)",
        negative: "不支持负向筛选",
        color: "#795548"
    },
    {
        param: "ry / rym",
        name: "水平旋转",
        syntax: "[ry=<最大>] [rym=<最小>]",
        desc: "筛选玩家的水平视角角度（-180 到 180）。",
        example: "@a[ry=90,rym=-90] (面向北方的玩家)",
        negative: "不支持负向筛选",
        color: "#673AB7"
    },
    {
        param: "l / lm",
        name: "生命值范围",
        syntax: "[l=<最大生命>] [lm=<最小生命>]",
        desc: "筛选生命值在指定范围内的实体。",
        example: "@e[l=10] (生命值小于等于 10)",
        negative: "@e[lm=20] (生命值大于等于 20)",
        color: "#F44336"
    },
    {
        param: "dx / dy / dz",
        name: "体积范围",
        syntax: "[dx=<x 范围> dy=<y 范围> dz=<z 范围>]",
        desc: "定义一个长方体区域进行选择。",
        example: "@e[x=0,y=0,z=0,dx=10,dy=5,dz=10]",
        negative: "不支持负向筛选",
        color: "#03A9F4"
    }
];