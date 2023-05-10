export const en = {
  // 通用
  common: {
    yes: 'OK',
    no: 'Cancel',
  },

  menu: {
    options: {
      title: 'OPTIONS',
      pages: {
        system: {
          title: 'System',
          options: {
            autoSpeed: {
              title: 'Autoplay Speed',
              options: {
                slow: 'Slow',
                medium: 'Medium',
                fast: 'Fast',
              },
            },
            language: {
              title: 'Language',
              options: {
                zhCn: '简体中文',
                en: 'English',
                jp: '日本語',
              },
            },
            resetData: {
              title: 'Clear or Reset Data',
              options: {
                clearGameSave: 'Clear game saving',
                resetSettings: 'Reset settings',
                clearAll: 'Clear all data',
              },
              dialogs: {
                clearGameSave: 'Are you sure you want to clear game saving',
                resetSettings: 'Are you sure you want to reset all settings',
                clearAll: 'Are you sure you want to clear all data',
              },
            },
            gameSave: {
              title: 'Import or Export Game Saving and Options',
              options: {
                export: 'Export game saving and options',
                import: 'Import game saving and options',
              },
              dialogs: {
                import: {
                  title: 'Are you sure you want to import game saving and options',
                  tip: 'Import game saving',
                  error: 'Parse game saving failed',
                },
              },
            },
          },
        },
        display: {
          title: 'Display',
          options: {
            textSpeed: {
              title: 'Speed of Text Showing',
              options: {
                slow: 'Slow',
                medium: 'Medium',
                fast: 'Fast',
              },
            },
            textSize: {
              title: 'Text Size',
              options: {
                small: 'Small',
                medium: 'Medium',
                large: 'Large',
              },
            },
            textFont: {
              title: 'Text Font',
              options: {
                siYuanSimSun: 'Source Han Serif',
                SimHei: 'Sans',
              },
            },
            textPreview: {
              title: 'Preview Text Showing',
            },
          },
        },
        sound: {
          title: 'Sound',
          options: {
            volumeMain: { title: 'Main Volume' },
            vocalVolume: { title: 'Vocal Volume' },
            bgmVolume: { title: 'BGM Volume' },
          },
        },
        // language: {
        //   title: '语言',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SAVE',
    },
    loadSaving: {
      title: 'LOAD',
    },
    title: {
      title: 'TITLE',
    },
    exit: {
      title: 'BACK',
    },
  },
};
