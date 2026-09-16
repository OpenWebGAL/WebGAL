import { assetSetter, fileType } from '@/Core/util/gameAssetsAccess/assetSetter';
import { composeCharacterImage } from './characterImageComposer';
import type { ICharacterFigureSource } from './characterFigureSource';
import {
  type ICharacterComposition,
  type ICharacterTemplate,
  resolveCharacterTemplateSelection,
  validateCharacterTemplate,
} from './characterTemplate';

class CharacterFigureService {
  private readonly templateTasks = new Map<string, Promise<ICharacterTemplate>>();
  private readonly compositionTasks = new Map<string, Promise<string>>();
  private readonly compositionResults = new Map<string, string>();

  public async prepare(source: ICharacterFigureSource): Promise<string> {
    const templateUrl = assetSetter(`${source.name}/figure.json`, fileType.figure);
    const template = await this.getTemplate(templateUrl);
    const composition: ICharacterComposition = resolveCharacterTemplateSelection(template, source.items);

    const key = JSON.stringify([templateUrl, composition.canvas, composition.layers.map((layer) => layer.name)]);
    const cachedResult = this.compositionResults.get(key);
    if (cachedResult) return cachedResult;
    const runningTask = this.compositionTasks.get(key);
    if (runningTask) return runningTask;

    const task = composeCharacterImage(composition, templateUrl)
      .then((sourceUrl) => {
        if (!sourceUrl) throw new Error(`角色 ${source.name} 未生成有效图片`);
        this.compositionResults.set(key, sourceUrl);
        return sourceUrl;
      })
      .finally(() => this.compositionTasks.delete(key));
    this.compositionTasks.set(key, task);
    return task;
  }

  private getTemplate(templateUrl: string): Promise<ICharacterTemplate> {
    const cachedTask = this.templateTasks.get(templateUrl);
    if (cachedTask) return cachedTask;
    const task = fetch(templateUrl)
      .then(async (response) => {
        if (!response.ok) throw new Error(`无法读取角色模板 ${templateUrl}：HTTP ${response.status}`);
        const template = (await response.json()) as ICharacterTemplate;
        validateCharacterTemplate(template);
        return template;
      })
      .catch((error) => {
        this.templateTasks.delete(templateUrl);
        throw error;
      });
    this.templateTasks.set(templateUrl, task);
    return task;
  }
}

export const characterFigureService = new CharacterFigureService();
