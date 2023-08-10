Voici la traduction du texte en français :

![WebGAL](https://user-images.githubusercontent.com/30483415/227242979-297ff392-f210-47ef-b0e9-d4788ddc8df0.png)

**[中文版本](/README.md)**
**[English](/README_EN.md)**

**[Aidez-nous avec la traduction | 协助翻译 | 翻訳のお手伝い](https://github.com/MakinoharaShoko/WebGAL/tree/dev/packages/webgal/src/translations)**

**[Rejoindre le serveur Discord](https://discord.gg/kPrQkJttJy)**

# WebGAL

**Un moteur de visual novel basé sur le web, attrayant visuellement, riche en fonctionnalités et facile à développer**

Vidéo de démonstration : https://www.bilibili.com/video/BV1jS4y1i7Wz/

## Expérience en ligne

Un exemple court :

https://demo.openwebgal.com

Un jeu complet :

[铃色☆记忆](http://hoshinasuzu.cn/) de Hoshinasuzu [Lien de secours](http://hoshinasuzu.cc/)

### Créer des jeux avec WebGAL

[Documentation de développement WebGAL](https://docs.openwebgal.com/)

[Télécharger l'éditeur graphique WebGAL](https://github.com/MakinoharaShoko/WebGAL_Terre/releases)

## Avantages et fonctionnalités de WebGAL

Écrivez une fois, exécutez partout, aucune expérience en développement web requise, apprenez toutes les syntaxes en 3 minutes, commencez à créer votre propre visual novel dès que l'inspiration vous frappe !

### Interface visuellement attrayante

Interface utilisateur graphique belle et élégante avec des effets d'interaction, le tout pour une meilleure expérience utilisateur.

### Riche en fonctionnalités

Prend en charge presque toutes les fonctionnalités des moteurs de visual novel populaires, et vous pouvez utiliser Pixi.js pour ajouter des effets personnalisés à votre jeu.

### Facile à développer

Que vous utilisiez les scripts WebGAL ou l'éditeur visuel pour le développement, tout est simple et naturel.

### Participer au développement de WebGAL

**Les développeurs souhaitant participer au développement du moteur, veuillez lire [le guide de participation pour ce projet](https://docs.openwebgal.com/developers/)**

### À propos de Live2D
Le moteur prend désormais en charge l'utilisation de modèles de personnages Live2D. Si vous souhaitez utiliser des modèles Live2D, suivez ces étapes :

1. Obtenir l'autorisation nécessaire pour utiliser Live2D.

2. Téléchargez Live2D et CubismCore aux liens suivants :

   - Live2D : https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js
   - CubismCore : https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js

3. Renommez `l2d.js` et `live2dcubismcore.min.js` respectivement, puis placez les fichiers dans `packages/webgal/src/assets/lib`, et décommentez ensuite les deux lignes suivantes dans `packages/webgal/index.html` pour qu'elles deviennent :
   ```
   htmlCopy code<script src="/src/assets/lib/l2d.js"></script>
   <script src="/src/assets/lib/live2dcubismcore.min.js"></script>
   ```

4. Dans le fichier `packages/webgal/src/Core/controller/stage/pixi/PixiController.ts`, décommentez les lignes suivantes :

   ```
   javascriptCopy codeimport { Live2DModel, SoundManager } from 'pixi-live2d-display';
   public addLive2dFigure(key: string, jsonPath: string, pos: string, motion: string) {
      // ...
   }
   ```

5. Dans le fichier `packages/webgal/src/Components/Stage/MainStage/useSetFigure.ts`, décommentez la ligne suivante :

   ```
   javascriptCopy code
   return WebGAL.gameplay.pixiStage?.addLive2dFigure(...args);
   ```

6. Vous pouvez désormais utiliser des modèles de personnages Live2D dans vos illustrations. Placez le répertoire complet du modèle dans le répertoire `game/figure`. Pour afficher un modèle de personnage, appelez le fichier JSON correspondant.

**Note : L'auteur de ce projet n'a utilisé aucun code source ou modèle du SDK Live2D. Toute demande de droits d'auteur découlant de l'utilisation de Live2D relève de la responsabilité exclusive des développeurs ou créateurs du projet modifié !**

### Soutenir

WebGAL est un logiciel open-source, vous pouvez donc utiliser ce logiciel gratuitement dans le cadre de la licence open-source MPL-2.0, et il est disponible pour une utilisation commerciale.

Cependant, votre soutien peut motiver les développeurs à avancer et à rendre ce projet encore meilleur.

[Soutenir ce projet](https://docs.openwebgal.com/sponsor/)

# Sponsors

## Sponsors Gold

| <img src="https://avatars.githubusercontent.com/u/91712707?v=4" alt="T2"   width="150px" height="150px" /> |
| ------------------------------------------------------------ |
| [T2-official(T2)](https://github.com/T2-official)            |

## Silver Sponsors
| <img src="https://avatars.githubusercontent.com/u/103700780?v=4" alt="IdrilK"  width="150px" height="150px" /> |
| ------------------------------------------------------------ |
| [IdrilK](https://github.com/IdrilK)            |

## Sponsors
| <img src="https://avatars.githubusercontent.com/u/71590526?v=4" alt="Yuji Sakai"  width="150px" height="150px" /> | <img src="https://avatars.githubusercontent.com/u/49630998?v=4" alt="Iara"  width="150px" height="150px" /> |
| ------------------------------------------------------------ |------------------------------------------------------------ |
| [Yuji Sakai (generalfreed)](https://github.com/generalfreed) |[Iara (labiker)](https://github.com/labiker) |

## Pour les amateurs de Stargazers (Historique GitHub stars)

[![Stargazers au fil du temps](https://starchart.cc/MakinoharaShoko/WebGAL.svg)](https://starchart.cc/MakinoharaShoko/WebGAL)