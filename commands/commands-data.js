// commands-data.js

// 指令类型枚举
const CommandType = {
    ALL: 1,              // 全部
    MOVEMENT: 2,         // 传送与移动
    ITEMS: 3,            // 物品管理
    ENTITIES: 4,         // 生物与实体
    WORLD: 5             // 世界设置
};

// 指令数据库
const commandsData = [
    {
        id: 1,
        name: "/tp",
        type: CommandType.MOVEMENT,
        typeName: "传送与移动",
        syntax: "/tp <目标：目标> <目的地：目标>",
        description: "传送实体。可以将玩家传送到另一个玩家或坐标处。",
        example: "/tp Steve Alex",
        tags: ["传送", "坐标", "移动"]
    },
    {
        id: 2,
        name: "/spawnpoint",
        type: CommandType.MOVEMENT,
        typeName: "传送与移动",
        syntax: "/spawnpoint [玩家：目标] [位置：x y z]",
        description: "设置玩家的重生点。如果不填坐标，则设为当前位置。",
        example: "/spawnpoint @p ~ ~ ~",
        tags: ["重生", "出生点", "移动"]
    },
    {
        id: 3,
        name: "/gamemode",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/gamemode <模式：GameMode> [玩家：目标]",
        description: "更改玩家的游戏模式。0=生存，1=创造，2=冒险，5=旁观。",
        example: "/gamemode 1",
        tags: ["创造", "生存", "模式"]
    },
    {
        id: 4,
        name: "/give",
        type: CommandType.ITEMS,
        typeName: "物品管理",
        syntax: "/give <玩家：目标> <物品名：字符串> [数量：整数] [数据：整数]",
        description: "给予玩家物品。支持复杂的 NBT 标签和组件。",
        example: "/give @p diamond_sword 1",
        tags: ["物品", "给予", "背包"]
    },
    {
        id: 5,
        name: "/clear",
        type: CommandType.ITEMS,
        typeName: "物品管理",
        syntax: "/clear [玩家：目标] [物品名：字符串] [数据：整数]",
        description: "清除玩家背包中的物品。如果不指定物品，则清空所有。",
        example: "/clear @a dirt",
        tags: ["清除", "背包", "物品"]
    },
    {
        id: 6,
        name: "/summon",
        type: CommandType.ENTITIES,
        typeName: "生物与实体",
        syntax: "/summon <实体类型：字符串> [生成位置：x y z]",
        description: "在指定位置生成一个实体。",
        example: "/summon creeper ~ ~1 ~",
        tags: ["生成", "生物", "怪物"]
    },
    {
        id: 7,
        name: "/kill",
        type: CommandType.ENTITIES,
        typeName: "生物与实体",
        syntax: "/kill [目标：目标]",
        description: "杀死实体。如果不指定目标，则杀死执行者自己。",
        example: "/kill @e[type=zombie]",
        tags: ["杀死", "清除", "战斗"]
    },
    {
        id: 8,
        name: "/gamerule",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/gamerule <规则：字符串> [值：布尔值]",
        description: "设置游戏规则。常用：keepInventory (死亡不掉落), doDaylightCycle (时间流逝)。",
        example: "/gamerule keepInventory true",
        tags: ["规则", "设置", "世界"]
    },
    {
        id: 9,
        name: "/time",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/time set <时间：整数 | 字符串>",
        description: "更改世界时间。可用值：day, night, noon, midnight。",
        example: "/time set night",
        tags: ["时间", "白天", "黑夜"]
    },
    {
        id: 10,
        name: "/weather",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/weather <天气：字符串> [持续时间：整数]",
        description: "更改天气。可用值：clear, rain, thunder。",
        example: "/weather clear",
        tags: ["天气", "下雨", "雷暴"]
    },
    {
        id: 11,
        name: "/difficulty",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/difficulty <难度：字符串>",
        description: "设置游戏难度。可用值：peaceful, easy, normal, hard。",
        example: "/difficulty peaceful",
        tags: ["难度", "设置"]
    },
    {
        id: 12,
        name: "/effect",
        type: CommandType.ENTITIES,
        typeName: "生物与实体",
        syntax: "/effect <目标：目标> <效果：字符串> [秒数：整数] [等级：整数]",
        description: "给予或清除实体状态效果。",
        example: "/effect @p speed 30 2",
        tags: ["效果", "药水", "状态"]
    },
    {
        id: 13,
        name: "/enchant",
        type: CommandType.ITEMS,
        typeName: "物品管理",
        syntax: "/enchant <玩家：目标> <附魔：字符串> [等级：整数]",
        description: "为玩家手持物品添加附魔。",
        example: "/enchant @p sharpness 5",
        tags: ["附魔", "物品", "强化"]
    },
    {
        id: 14,
        name: "/xp",
        type: CommandType.ENTITIES,
        typeName: "生物与实体",
        syntax: "/xp <数量：整数> [玩家：目标]",
        description: "给予玩家经验值。",
        example: "/xp 100 @p",
        tags: ["经验", "等级", "玩家"]
    },
    {
        id: 15,
        name: "/setblock",
        type: CommandType.WORLD,
        typeName: "世界设置",
        syntax: "/setblock <位置：x y z> <方块：字符串> [方块状态：字符串]",
        description: "在指定位置放置一个方块。",
        example: "/setblock ~ ~1 ~ diamond_block",
        tags: ["方块", "放置", "建筑"]
    }
];