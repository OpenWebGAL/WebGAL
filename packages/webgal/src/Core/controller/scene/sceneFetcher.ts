import axios from 'axios';

/**
 * 原始场景文件获取函数
 * @param sceneUrl 场景文件路径
 */
export const sceneFetcher = (sceneUrl: string) => {
  return new Promise<string>((resolve) => {
    axios.get(encodeURI(sceneUrl)).then((response) => {
      const rawScene: string = response.data.toString();
      resolve(rawScene);
    });
  });
};
