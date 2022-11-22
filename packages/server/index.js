const express = require('express');
const Cloudlog = require("cloudlogjs");
const fs = require('fs');
const path = require('path');
const rl = require('readline');
const open = require('open');

// 读取控制台输入
const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout
})

const server = new express();
const Port = process.env.PORT || 3000;
const logger = new Cloudlog();

// 读取控制台数据
const args = process.argv;
logger.info(`WebGAL Server 启动参数：`, args);

// 读取工作目录
const cwd = process.cwd();
logger.info(`WebGAL 工作目录当前为 ${cwd}`);

// 检测并获取 WebGAL 游戏资源所在目录
let webgalWd = '';

// 参数模式
if (args.length >= 3) {
    // 参数就是工作目录
    const wdr = args[2];
    logger.info(`指定工作目录：${wdr}`);
    if (wdr[0] === '/' || wdr.match(/^\w:/)) {
        // 绝对路径模式
        logger.debug('绝对路径模式');
        webgalWd = wdr;
    } else {
        // 相对路径模式
        logger.debug('相对路径模式');
        const rwd = wdr.split(/[\\\/]/g);
        webgalWd = path.join(cwd, ...rwd);
    }
    // 输出
    logger.info(`工作目录被设置为 ${webgalWd}`);
}

// 自动探测模式
if (webgalWd === '') {
    const dirInfo = fs.readdirSync(cwd);
    if (dirInfo.includes('index.html')) {
        logger.info(`在当前工作目录下启动 WebGAL`);
        webgalWd = cwd;
    } else {
        // 全转成大写，复制一份副本
        const dirInfoUpperCase = dirInfo.map(e => e.toUpperCase());
        if (dirInfoUpperCase.includes('WEBGAL')) {
            // 找 index
            const index = dirInfoUpperCase.findIndex(e => e === 'WEBGAL');
            const trueDirName = dirInfo[index];
            webgalWd = path.join(cwd, trueDirName);
        } else {
            // 没找到
            logger.info(`未找到 WebGAL 文件，请在 WebGAL 项目目录下启动 WebGAL-Server 或在本目录下的 WebGAL 文件夹下启动。`);
        }
    }
}

if (webgalWd) {
    // 监听端口
    server.use(express.static(webgalWd))//allow browser access resources
    server.listen(Port, () => {
        logger.info(`启动 WebGAL 服务器，运行于 http://localhost:${Port} .`)
    })
    open(`http://localhost:${Port}`);
} else {
    logger.error(`未找到启动文件，请退出`);
    readline.on('line', () => {
        process.exit();
    })
}
