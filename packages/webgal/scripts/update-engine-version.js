#!/usr/bin/env node

/**
 * 自动更新 webgal-engine.json 中的版本号
 * 从 package.json 读取版本号并同步到 webgal-engine.json
 */

const fs = require('fs');
const path = require('path');

// 文件路径
const packageJsonPath = path.resolve(__dirname, '../package.json');
const engineJsonPath = path.resolve(__dirname, '../public/webgal-engine.json');

try {
  // 读取 package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const version = packageJson.version;

  if (!version) {
    console.error('❌ 错误: package.json 中未找到版本号');
    process.exit(1);
  }

  // 读取 webgal-engine.json
  const engineJson = JSON.parse(fs.readFileSync(engineJsonPath, 'utf-8'));

  // 更新版本号
  const oldVersion = engineJson.version;
  engineJson.version = version;
  engineJson.webgalVersion = version;

  // 写回文件（保持格式化）
  fs.writeFileSync(engineJsonPath, JSON.stringify(engineJson, null, 2) + '\n', 'utf-8');

  console.log('✅ 成功更新引擎描述文件版本号');
  console.log(`   ${oldVersion} → ${version}`);
  console.log(`   文件: ${path.relative(process.cwd(), engineJsonPath)}`);
} catch (error) {
  console.error('❌ 更新版本号失败:', error.message);
  process.exit(1);
}
