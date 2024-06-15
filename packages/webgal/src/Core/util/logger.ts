import Cloudlog from 'cloudlogjs';

/**
 * 日志打印工具
 */
export const logger = new Cloudlog();
if (process.env.NODE_ENV === 'production') {
  logger.setLevel('INFO');
}
