import { pixiSnow } from '@/Core/gameScripts/pixiPerformScripts/snow';
import { registerPerform } from './pixiPerformManager';
import { pixicherryBlossoms } from '@/Core/gameScripts/pixiPerformScripts/cherryBlossoms';
import { pixiRain } from '@/Core/gameScripts/pixiPerformScripts/rain';

registerPerform('rain', () => pixiRain(6, 10));
registerPerform('snow', () => pixiSnow(3));
registerPerform('cherryBlossoms', () => pixicherryBlossoms(3));
