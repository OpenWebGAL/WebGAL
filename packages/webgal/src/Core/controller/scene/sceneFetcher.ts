import axios from 'axios';

/**
 * 原始场景文件获取函数
 * @param sceneUrl 场景文件路径
 */
export const sceneFetcher = (sceneUrl: string) => {
  return new Promise<string>((resolve, reject) => {
    let scenePath = '';
    try {
      scenePath = sceneUrl ? new URL(sceneUrl, window.location.href).pathname : '';
    } catch {
      scenePath = '';
    }
    if (!scenePath.endsWith('.txt')) {
      reject('Scene file must be a txt file');
      return;
    }
    axios
      .get(sceneUrl)
      .then((response) => {
        const rawScene: string = response.data.toString();
        resolve(rawScene);
      })
      .catch((e) => {
        reject(e);
      });
  });
};
