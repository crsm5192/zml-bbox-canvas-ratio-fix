/**
 * zml-bbox-canvas-ratio-fix
 * -------------------------
 * "创建边界框"(CreateBoundingBoxes) 画布比例跟随分辨率补丁。
 *
 * 问题
 * ----
 * 前端画布的宽高比取自节点上 width / height 两个 widget 的 .value：
 *   useBoundingBoxes.ts 里 dimWidget('width') / dimWidget('height')，
 *   aspectRatio = `${widthValue} / ${heightValue}`。
 * 当这两个口接了上游（如 ZML 预设分辨率的 宽/高 输出）时，widget 只剩
 * 转换前的旧手动值，Vue 读不到连线上的真实值，画布比例就永远是旧的。
 *
 * 方案
 * ----
 * 后端每次运行都把真实使用的宽高放进 executed 消息：
 *   comfy_extras/nodes_bounding_boxes.py::execute 里 ui = {"dims": [w, h]}
 *   server.py 把它作为 output 下发 —— 官方前端目前没有使用它。
 * 本补丁监听 executed，把真实宽高写回两个 widget。这与官方"背景图
 * 自适应尺寸"(applyImageDimensions) 是同一条写值路径：
 *   watch([widthValue, heightValue]) 会触发 syncState()，
 *   画布比例、网格吸附、已画的框都会按新尺寸重投影（框保持相对位置）。
 *
 * 效果：改分辨率后点一次运行，画布即变成对应比例。
 * 只写接了连线的口；没接线的 width/height 仍完全由用户手动控制。
 * 节点在子图内时，仅当主图中能按 id 找到该节点时生效（当前工作流
 * 的 CreateBoundingBoxes 位于主图，属于此范围）。
 */

import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

const NODE_TYPE = "CreateBoundingBoxes";

function findTargetNode(detail) {
  const graph = app.graph;
  if (!graph || detail == null) return null;
  for (const id of [detail.node, detail.display_node]) {
    if (id == null) continue;
    const node = graph.getNodeById(id);
    if (node && node.type === NODE_TYPE) return node;
  }
  return null;
}

function inputConnected(node, name) {
  const slot = (node.inputs || []).find((i) => i && i.name === name);
  return !!(slot && slot.link != null);
}

function applyDims(node, width, height) {
  let changed = false;
  for (const [name, value] of [
    ["width", width],
    ["height", height],
  ]) {
    if (!Number.isFinite(value) || value <= 0) continue;
    if (!inputConnected(node, name)) continue; // 手动口不抢
    const widget = (node.widgets || []).find((w) => w && w.name === name);
    if (!widget) continue;
    const target = Math.round(value);
    if (widget.value === target) continue;
    widget.value = target;
    if (typeof widget.callback === "function") widget.callback(target);
    changed = true;
  }
  if (changed && typeof node.setDirtyCanvas === "function") {
    node.setDirtyCanvas(true, true);
  }
}

app.registerExtension({
  name: "zml.bboxCanvasRatioFix",
  setup() {
    api.addEventListener("executed", (event) => {
      const detail = event.detail ?? {};
      const dims = detail.output?.dims;
      if (!Array.isArray(dims) || dims.length < 2) return;
      const node = findTargetNode(detail);
      if (node) applyDims(node, dims[0], dims[1]);
    });
  },
});
