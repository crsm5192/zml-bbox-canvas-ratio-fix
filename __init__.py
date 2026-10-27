"""zml-bbox-canvas-ratio-fix：画布比例跟随分辨率补丁（前端注入）。

本包不注册任何节点（NODE_CLASS_MAPPINGS 为空），只通过 WEB_DIRECTORY
向前端注入一个 JS 扩展，让"创建边界框"(CreateBoundingBoxes) 的绘制区
在运行一次后按真实分辨率显示对应宽高比。

问题与方案详见 web/js/bbox_canvas_ratio_fix.js 顶部注释。

删除本目录并重启 ComfyUI 即可完全还原。
"""

NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}
WEB_DIRECTORY = "./web"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
