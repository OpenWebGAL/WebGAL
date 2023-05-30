const jp = {
  // 通用
  common: {
    yes: 'はい',
    no: 'いいえ',
  },

  menu: {
    options: {
      title: 'CONFIG',
      pages: {
        system: {
          title: 'システム',
          options: {
            autoSpeed: {
              title: '自動再生速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
              },
            },
            language: {
              title: '言語',
            },
            resetData: {
              title: 'データの削除またに復元',
              options: {
                clearGameSave: 'すべてのアーカイブを削除',
                resetSettings: 'デフォルト設置を復元',
                clearAll: 'すべてのデータを削除',
              },
              dialogs: {
                clearGameSave: 'アーカイブをクリアしてもよろしいですか？',
                resetSettings: 'デフォルト設定を復元してもよろしいですか？',
                clearAll: 'すべてのデータを削除してもよろしいですか？',
              },
            },
            gameSave: {
              title: 'アーカイブとオプションのインポートまたはエクスポート',
              options: {
                export: 'アーカイブとオプションのエクスポート',
                import: 'アーカイブとオプションのインポート',
              },
              dialogs: {
                import: {
                  title: 'アーカイブとオプションをインポートしますか？',
                  tip: 'インポートアーカイブ',
                  error: 'アーカイブの解析に失败しました',
                },
              },
            },
          },
        },
        display: {
          title: 'ウィンドウ',
          options: {
            textSpeed: {
              title: 'テキスト表示速度',
              options: {
                slow: '遅く',
                medium: '標準',
                fast: '速く',
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
              title: 'フォント',
              options: {
                siYuanSimSun: '源ノ明朝',
                SimHei: '黒体',
              },
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
              // todo
              text: 'プレビューはテキストボックスのテキストサイズとテキスト表示速度です。上記のオプションでフォントも変更できます。',
            },
          },
        },
        sound: {
          title: 'サウンド',
          options: {
            volumeMain: { title: '主音量' },
            vocalVolume: { title: '声量' },
            bgmVolume: { title: 'BGMの音量' },
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
      isOverwrite: '上書きしますか？',
    },
    loadSaving: {
      title: 'LOAD',
    },
    title: {
      title: 'HOME',
    },
    exit: {
      title: 'BACK',
    },
  },

  // todo
  title: {
    start: {
      title: '初めから',
      subtitle: 'START',
    },
    continue: {
      title: '続きから',
      subtitle: 'CONTINUE',
    },
    options: {
      title: '設定',
      subtitle: 'CONFIG',
    },
    load: {
      title: 'ロード',
      subtitle: 'LOAD',
    },
    extra: {
      title: '鑑賞モード',
      subtitle: 'EXTRA',
    },
  },

  gaming: {
    noSaving: 'クイックセーブなし',
    buttons: {
      hide: 'CLOSE',
      show: 'SHOW',
      backlog: 'LOG',
      replay: 'REPLAY',
      auto: 'AUTO',
      forward: 'SKIP',
      quicklySave: 'QUICK SAVE',
      quicklyLoad: 'QUICK LOAD',
      save: 'SAVE',
      load: 'LOAD',
      options: 'CONFIG',
      title: 'HOME',
    },
  },

  extra: {
    title: '鑑賞モード',
  },
};

export default jp;
