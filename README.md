# zml-bbox-canvas-ratio-fix

一个"纯补丁"式的 ComfyUI 前端扩展：**不修改 ComfyUI 与任何插件的文件**，
只向画布"创建边界框"节点注入一个 JS 小补丁，让绘制区比例跟随真实分辨率。
删除本目录（重启 ComfyUI）即可完全还原。

> 本项目由 **ZCode**（AI 编程客户端，Z.ai）驱动 **GLM 大语言模型**（Z.ai）
> 编写，2026-10-27。

## 解决什么问题

ComfyUI 核心节点 **创建边界框**（`CreateBoundingBoxes`，
`comfy_extras/nodes_bounding_boxes.py`）的绘制画布宽高比取自节点上
`width` / `height` 两个 widget 的值。

当这两个输入口接了上游（例如 ZML 预设分辨率节点的 宽/高 输出）时，
widget 只保留转换成输入之前的旧手动值（如 768×1024），前端读不到连线上的
真实分辨率，于是画布比例永远是旧的、固定不变，不随所选分辨率变化。

## 修复方式

后端每次运行都会把真实使用的宽高放进 `executed` 消息的
`output.dims`（见 `nodes_bounding_boxes.py::execute` 的 `ui = {"dims": [w, h]}`），
官方前端目前没有使用它。本补丁监听该消息，把真实宽高写回两个 widget：

* 与官方"背景图自适应尺寸"（`applyImageDimensions`）是同一条写值路径，
  画布比例、网格吸附、已画的框都会自动按新尺寸重投影（框保持相对位置）。
* **效果：更改分辨率后点一次运行，画布即变成对应比例。**
* 只写接了连线的口；没接线的 `width` / `height` 仍完全由手动控制。
* 修正后的值会随工作流一起保存，下次打开时即是正确比例。
* 节点位于主图时生效（子图嵌套内暂不支持）。

## 安装

把整个 `zml-bbox-canvas-ratio-fix` 文件夹放进 ComfyUI 的
`custom_nodes` 目录（里面的 `web/js/bbox_canvas_ratio_fix.js` 会被前端
自动加载），重启 ComfyUI：

```
ComfyUI/custom_nodes/zml-bbox-canvas-ratio-fix/
├── __init__.py                  # 空节点映射 + WEB_DIRECTORY 声明
└── web/js/bbox_canvas_ratio_fix.js  # 补丁本体（含详细中文注释）
```

Windows 下也可以直接运行仓库里的 `install.bat`（安装路径写在脚本里，
按需修改）。

## 使用

1. 像平常一样把分辨率节点的 宽/高 接到 创建边界框 的 `width` / `height`。
2. 更换分辨率预设。
3. **点一次运行**——节点执行完成后，画布立刻变成对应宽高比，
   已画的框按相对位置重投影。

## 卸载

删除 `custom_nodes/zml-bbox-canvas-ratio-fix` 目录，重启 ComfyUI。

## 推送到 GitHub

`gh` CLI 已登录时可忽略 `github_token.txt`，直接：

```bash
git push
```

若用 API Key 推送：把 key 写入本目录的 `github_token.txt`
（已被 .gitignore 排除，不会进入版本库），然后运行 `push_to_github.sh`。
