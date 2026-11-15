# 安装依赖并构建
yarn
yarn build

# 进入 Terre 目录
cd ../WebGAL_Terre/packages/terre2/assets/templates/WebGAL_Template || exit
# 删除其他文件
rm -r assets
rm -r index.html
rm -r webgal-serviceworker.js

# 进入 WebGAL 构建目录
cd ../../../../../../WebGAL/packages/webgal || exit
# 复制 WebGAL_Template
cp -r dist/index.html ../../../WebGAL_Terre/packages/terre2/assets/templates/WebGAL_Template
cp -r dist/assets ../../../WebGAL_Terre/packages/terre2/assets/templates/WebGAL_Template
cp -r dist/webgal-serviceworker.js ../../../WebGAL_Terre/packages/terre2/assets/templates/WebGAL_Template

# 同步默认自定义界面模板产物到 WebGAL_Default_Template
DEFAULT_TEMPLATE_DIR="../../../WebGAL_Terre/packages/terre2/assets/templates/WebGAL_Default_Template"
mkdir -p "$DEFAULT_TEMPLATE_DIR"
rm -rf "$DEFAULT_TEMPLATE_DIR/screens"
cp -r dist/game/template/screens "$DEFAULT_TEMPLATE_DIR/screens"
cp dist/game/template/template.json "$DEFAULT_TEMPLATE_DIR/template.json"
