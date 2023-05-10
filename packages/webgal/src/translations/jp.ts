export const jp = {
  // 通用
  common: {
    yes: 'はい',
    no: 'いいえ',
  },

  menu: {
    options: {
      title: 'OPTIONS',
      pages: {
        system: {
          title: 'システム',
          options: {
            autoSpeed: {
              title: '自動再生速度',
              options: {
                slow: '遅い',
                medium: '基準',
                fast: '速い',
              },
            },
            language: {
              title: '言語',
              options: {
                zhCn: '简体中文',
                en: 'English',
                jp: '日本語',
              },
            },
            resetData: {
              title: 'データの削除またに復元',
              options: {
                clearGameSave: '全てのアーカイブ削除',
                resetSettings: 'デフォルト設置を復元',
                clearAll: '全てのデータを削除',
              },
              dialogs: {
                clearGameSave: 'アーカイブをクリアしてもよろしいでしか',
                resetSettings: 'デフォルト設定を復元してもよろしいですか',
                clearAll: '全てのデータを削除してもよろしいですか',
              },
            },
            gameSave: {
              title: 'アーカイブとオプションの導入または導出',
              options: {
                export: 'アーカイブとオプションの導出',
                import: 'アーカイブとオプションの導入',
              },
              dialogs: {
                import: {
                  title: 'アーカイブとオプションを導入しますか',
                  tip: '導入アーカイブ',
                  error: 'アーカイブ解析に失败しました',
                },
              },
            },
          },
        },
        display: {
          title: '画面',
          options: {
            textSpeed: {
              title: 'テキスト表示速度',
              options: {
                slow: '遅い',
                medium: '基準',
                fast: '速い',
              },
            },
            textSize: {
              title: 'テキストサイズ',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            textFont: {
              title: 'テキストフォント',
              options: {
                siYuanSimSun: '源ノ明朝',
                SimHei: '黒体',
              },
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
              // todo
              text: '现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。',
            },
          },
        },
        sound: {
          title: 'サウンド',
          options: {
            volumeMain: { title: 'マスターボリューム' },
            vocalVolume: { title: '声量' },
            bgmVolume: { title: 'BGMのボリューム' },
          },
        },
        // language: {
        //   title: '言語',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SAVE',
      isOverwrite: '是否覆盖存档？',
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

  // todo
  title: {
    start: {
      title: '开始游戏',
      subtitle: 'START',
    },
    continue: {
      title: '继续游戏',
      subtitle: 'CONTINUE',
    },
    options: {
      title: '游戏选项',
      subtitle: 'OPTIONS',
    },
    load: {
      title: '读取存档',
      subtitle: 'LOAD',
    },
    extra: {
      title: '鉴赏模式',
      subtitle: 'EXTRA',
    },
  },

  gaming: {
    noSaving: '暂无存档',
    buttons: {
      hide: '隐藏',
      show: '显示',
      backlog: '回想',
      replay: '重播',
      auto: '自动',
      forward: '快进',
      quicklySave: '快速存档',
      quicklyLoad: '快速读档',
      save: '存档',
      load: '读档',
      options: '选项',
      title: '标题',
    },
  },

  extra: {
    title: '鉴赏模式',
  },
};
