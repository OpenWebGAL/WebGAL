import { CharacterTemplateError, type ICharacterComposition } from './characterTemplate';

interface ILoadedCharacterImage {
  source: CanvasImageSource;
  width: number;
  height: number;
}

export async function composeCharacterImage(composition: ICharacterComposition, templateUrl: string): Promise<string> {
  const loadedLayers = await Promise.all(
    composition.layers.map(async (layer) => ({
      layer,
      image: await loadCharacterImage(resolveCharacterComponentUrl(layer.src, templateUrl)),
    })),
  );
  const canvas = document.createElement('canvas');
  canvas.width = composition.canvas.width;
  canvas.height = composition.canvas.height;
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('无法创建角色组合画布');
  }
  for (const { layer, image } of loadedLayers) {
    const { width, height } = resolveDrawSize(layer, image);
    context.drawImage(image.source, layer.x, layer.y, width, height);
  }
  return canvas.toDataURL('image/png');
}

function resolveDrawSize(
  layer: ICharacterComposition['layers'][number],
  image: ILoadedCharacterImage,
): { width: number; height: number } {
  if (layer.width !== undefined && layer.height !== undefined) {
    return { width: layer.width, height: layer.height };
  }
  if (layer.scale !== undefined) {
    return { width: image.width * layer.scale, height: image.height * layer.scale };
  }
  return { width: image.width, height: image.height };
}

function resolveCharacterComponentUrl(componentPath: string, templateUrl: string): string {
  const characterDirectoryUrl = new URL('./', new URL(templateUrl, window.location.href));
  const componentUrl = new URL(componentPath, characterDirectoryUrl);
  if (
    componentUrl.origin !== characterDirectoryUrl.origin ||
    !componentUrl.pathname.startsWith(characterDirectoryUrl.pathname)
  ) {
    throw new CharacterTemplateError(`角色部件路径越出角色目录：${componentPath}`);
  }
  return componentUrl.toString();
}

function loadCharacterImage(sourceUrl: string): Promise<ILoadedCharacterImage> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ source: image, width: image.naturalWidth || image.width, height: image.naturalHeight || image.height });
    image.onerror = () => reject(new Error(`无法加载角色部件：${sourceUrl}`));
    image.src = sourceUrl;
  });
}
