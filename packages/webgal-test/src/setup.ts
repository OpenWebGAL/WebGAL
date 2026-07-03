/**
 * Vitest setupFile — 每个 test worker 启动时执行
 */
console.log('🧪 WebGAL Integration Test');
console.log(`   URL: ${process.env.WEBGAL_TEST_URL ?? 'http://localhost:4173'}`);
console.log(`   Headless: ${process.env.WEBGAL_TEST_HEADLESS !== 'false'}`);
console.log('');
