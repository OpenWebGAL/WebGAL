const fr = {
  // 通用
  common: {
    yes: 'OK',
    no: 'Annuler',
  },

  menu: {
    options: {
      title: 'OPTIONS',
      pages: {
        system: {
          title: 'Système',
          options: {
            autoSpeed: {
              title: 'Vitesse de lecture automatique',
              options: {
                slow: 'Lente',
                medium: 'Moyenne',
                fast: 'Rapide',
              },
            },
            language: {
              title: 'Langue',
            },
            resetData: {
              title: 'Effacer ou réinitialiser les données',
              options: {
                clearGameSave: 'Effacer la sauvegarde du jeu',
                resetSettings: 'Réinitialiser les paramètres',
                clearAll: 'Tout effacer',
              },
              dialogs: {
                clearGameSave: 'Êtes-vous sûr de vouloir effacer la sauvegarde du jeu',
                resetSettings: 'Êtes-vous sûr de vouloir réinitialiser tous les paramètres',
                clearAll: 'Êtes-vous sûr de vouloir tout effacer',
              },
            },
            gameSave: {
              title: 'Importer ou exporter la sauvegarde du jeu et les options',
              options: {
                export: 'Exporter la sauvegarde du jeu et les options',
                import: 'Importer la sauvegarde du jeu et les options',
              },
              dialogs: {
                import: {
                  title: 'Êtes-vous sûr de vouloir importer la sauvegarde du jeu et les options',
                  tip: 'Importer la sauvegarde du jeu',
                  error: "Impossible d'analyser la sauvegarde du jeu",
                },
              },
            },
            about: {
              title: 'À propos de WebGAL',
              subTitle: 'WebGAL: Un moteur de visual novel basé sur le web en open-source',
              version: 'Version',
              source: 'Dépôt de code source',
              contributors: 'Contributeurs',
              website: 'Site web',
            },
          },
        },
        display: {
          title: 'Affichage',
          options: {
            textSpeed: {
              title: "Vitesse d'affichage du texte",
              options: {
                slow: 'Lente',
                medium: 'Moyenne',
                fast: 'Rapide',
              },
            },
            textSize: {
              title: 'Taille du texte',
              options: {
                small: 'Petite',
                medium: 'Moyenne',
                large: 'Grande',
              },
            },
            textFont: {
              title: 'Police du texte',
              options: {
                siYuanSimSun: 'Source Han Serif',
                SimHei: 'Sans',
                lxgw: 'LXGW WenKai',
              },
            },
            textPreview: {
              title: "Aperçu de l'affichage du texte",
              text: 'Vous prévisualisez la police, la taille et la vitesse de lecture du texte, maintenant. Vous pouvez ajuster les options ci-dessus selon votre perception.',
            },
          },
        },
        sound: {
          title: 'Son',
          options: {
            volumeMain: { title: 'Volume principal' },
            vocalVolume: { title: 'Volume des voix' },
            bgmVolume: { title: 'Volume de la musique de fond' },
            seVolume: { title: 'Volume des effets sonores' },
            uiSeVolume: { title: 'Volume de l’interface utilisateur' },
          },
        },
        // language: {
        //   title: 'Langue',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SAUVEGARDER',
      isOverwrite: 'Êtes-vous sûr de vouloir écraser cette sauvegarde ?',
    },
    loadSaving: {
      title: 'CHARGER',
    },
    title: {
      title: 'TITRE',
    },
    exit: {
      title: 'RETOUR',
    },
  },

  title: {
    start: {
      title: 'COMMENCER',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUER',
      subtitle: '',
    },
    options: {
      title: 'OPTIONS',
      subtitle: '',
    },
    load: {
      title: 'CHARGER',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
  },

  gaming: {
    noSaving: 'Aucune sauvegarde',
    buttons: {
      hide: 'Masquer',
      show: 'Afficher',
      backlog: 'Journal',
      replay: 'Rejouer',
      auto: 'Automatique',
      forward: 'Avancer',
      quicklySave: 'Sauvegarde rapide',
      quicklyLoad: 'Chargement rapide',
      save: 'Sauvegarder',
      load: 'Charger',
      options: 'Options',
      title: 'Titre',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default fr;
