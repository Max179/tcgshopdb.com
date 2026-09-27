# TCG Card Shop Simulator — 数据边界报告（Windows 端）

**记录时间：** 2026-09-25 · **记录者：** Windows Harness（总负责人）

## 游戏包
| 项 | 值 |
|---|---|
| 安装路径 | `C:\uTorria\Downloads\TCG Card Shop Simulator` |
| 可执行 | `Card Shop Simulator.exe` |
| 版本标签 | `OPNeonGames | Card Shop Simulator`（`_Data/app.info`） |
| 引擎 | **Unity**（`UnityPlayer.dll` 32.2 MB） |
| 脚本后端 | **Mono** — `_Data\Managed\Assembly-CSharp.dll`（1.41 MB） |
| 数据根 | `Card Shop Simulator_Data` |

## 可读文件类型与体积
| 文件 | 体积 | 用途 |
|---|---|---|
| `sharedassets2.assets` | 839 MB | 主资源对象 |
| `sharedassets2.assets.resS` | 3.5 GB | 大对象流（贴图/音频）·**不入 Git** |
| `sharedassets0/1.assets(.resS)` | 38 MB / 126 MB | 其它资源 |
| `level1` / `level2` | 1.7 / 55.7 MB | 场景（对象实例） |
| `resources.assets` | 13.8 MB | 资源 |
| `Managed\Assembly-CSharp.dll` | 1.41 MB | **字段布局来源（ECMA-335）** |

## 数据边界结论
- **可读可核验：** ECMA-335 托管程序集（类型/字段/枚举与常量）+ SerializedFile 对象表。Mono 后端使字段布局可由元数据**推导**，无需 IL2CPP 元数据。
- **P0 目标：** 卡牌、卡包/产品、系列、稀有度、价格、店铺设施、顾客需求、库存/补货、升级、经济数值。
- **方法来源：** 仅复用架构与测试方法（程序集字段布局 → SerializedFile 对象字节的确定性读取），**不复用任何其它游戏的数据**。
- **不入 Git：** 游戏包本体与 `Card Shop Simulator_Data`。
