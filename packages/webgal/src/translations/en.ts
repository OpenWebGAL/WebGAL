const en = {
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
            about: {
              title: 'About WebGAL',
              subTitle: 'WebGAL: An Open-Source Web-Based Visual Novel Engine',
              version: 'Version',
              source: 'Source Code Repository',
              contributors: 'Contributors',
              website: 'Website',
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
                lxgw: 'LXGW WenKai',
              },
            },
            textPreview: {
              title: 'Preview Text Showing',
              text: "You are previewing the text's font, size and playback speed, now. You can adjust the above options according to your perception.",
            },
          },
        },
        sound: {
          title: 'Sound',
          options: {
            volumeMain: { title: 'Main Volume' },
            vocalVolume: { title: 'Vocal Volume' },
            bgmVolume: { title: 'BGM Volume' },
            seVolume: { title: 'Sound Effects Volume' },
            uiSeVolume: { title: 'UI Sound Effects Volume' },
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
      isOverwrite: 'Are you sure you want to overwrite this save?',
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

  title: {
    start: {
      title: 'START',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUE',
      subtitle: '',
    },
    options: {
      title: 'OPTIONS',
      subtitle: '',
    },
    load: {
      title: 'LOAD',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
  },

  gaming: {
    noSaving: 'No saving',
    buttons: {
      hide: 'Hide',
      show: 'Show',
      backlog: 'Backlog',
      replay: 'Replay',
      auto: 'Auto',
      forward: 'Forward',
      quicklySave: 'Quickly Save',
      quicklyLoad: 'Quickly Save',
      save: 'Save',
      load: 'Load',
      options: 'Options',
      title: 'Title',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default en;
