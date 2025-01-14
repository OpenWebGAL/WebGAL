const zhTw = {
  // 通用
  common: {
    yes: '是',
    no: '否',
  },

  menu: {
    options: {
      title: '設定',
      pages: {
        system: {
          title: '系統',
          options: {
            autoSpeed: {
              title: '自動播放速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            language: {
              title: '語言',
            },
            resetData: {
              title: '清除或還原紀錄',
              options: {
                clearGameSave: '清除所有存檔',
                resetSettings: '還原預設設定',
                clearAll: '清除所有紀錄',
              },
              dialogs: {
                clearGameSave: '確定要清除存檔嗎',
                resetSettings: '確定要還原預設設定嗎',
                clearAll: '確定要清除所有紀錄嗎',
              },
            },
            gameSave: {
              title: '匯入或匯出存檔與設定',
              options: {
                export: '匯出存檔與設定',
                import: '匯入存檔與設定',
              },
              dialogs: {
                import: {
                  title: '確定要匯入存檔與設定嗎',
                  tip: '匯入存檔',
                  error: '存檔匯入失敗',
                },
              },
            },
            about: {
              title: '關於 WebGAL',
              subTitle: 'WebGAL：開源的線上視覺小說製作引擎',
              version: '版本號',
              source: '原始碼倉庫',
              contributors: '貢獻者',
              website: '網站',
            },
          },
        },
        display: {
          title: '顯示',
          options: {
            fullScreen: {
              title: '全螢幕模式',
              options: {
                on: '開啟',
                off: '關閉',
              },
            },
            textSpeed: {
              title: '文字顯示速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            textSize: {
              title: '文字大小',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            textFont: {
              title: '文字字體',
              options: {
                siYuanSimSun: '思源宋體',
                SimHei: '黑體',
                lxgw: '霞鶩文楷',
              },
            },
            textboxOpacity: {
              title: '文字方塊不透明度',
            },
            textPreview: {
              title: '文字顯示預覽',
              text: '現在預覽的是文字方塊字體大小和播放速度的情況，您可以根據您的觀感調整上面的設定。',
            },
          },
        },
        sound: {
          title: '音量',
          options: {
            volumeMain: { title: '主音量' },
            vocalVolume: { title: '語音音量' },
            bgmVolume: { title: '背景音樂音量' },
            seVolume: { title: '音效音量' },
            uiSeVolume: { title: '介面音效音量' },
            voiceOption: { title: '是否中斷語音' },
            voiceStop: { title: '停止語音' },
            voiceContinue: { title: '繼續語音' },
          },
        },
        // language: {
        //   title: '語言',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: '存檔',
      isOverwrite: '是否要覆蓋存檔?',
    },
    loadSaving: {
      title: '讀檔',
    },
    title: {
      title: '主選單',
      options: {
        load: '',
        extra: 'CG模式',
      },
    },
    exit: {
      title: '返回',
    },
  },

  title: {
    start: {
      title: '開始遊戲',
      subtitle: 'START',
    },
    continue: {
      title: '繼續遊戲',
      subtitle: 'CONTINUE',
    },
    options: {
      title: '遊戲設定',
      subtitle: 'OPTIONS',
    },
    load: {
      title: '讀取存檔',
      subtitle: 'LOAD',
    },
    extra: {
      title: 'CG模式',
      subtitle: 'EXTRA',
    },
  },

  gaming: {
    noSaving: '暫無存檔',
    buttons: {
      hide: '隱藏',
      show: '顯示',
      backlog: '回想',
      replay: '重播',
      auto: '自動',
      forward: '加速',
      quicklySave: '快速存檔',
      quicklyLoad: '快速讀檔',
      save: '存檔',
      load: '讀檔',
      options: '設定',
      title: '主選單',
      titleTips: '確認返回到主選單嗎',
    },
  },

  extra: {
    title: 'CG模式',
  },
};

export default zhTw;
