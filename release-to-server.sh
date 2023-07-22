# 安装依赖并构建
yarn
yarn build

# 进入 WebGAL 构建目录
cd packages || exit
rm -r server/WebGAL/*
cd webgal || exit
# 复制
cp -r dist/index.html ../server/WebGAL
cp -r dist/assets ../server/WebGAL
cp -r dist/game ../server/WebGAL
cp -r dist/webgal-serviceworker.js ../server/WebGAL
