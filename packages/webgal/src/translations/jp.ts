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
              title: 'データの復元と削除',
              options: {
                clearGameSave: 'すべてのセーブデータを削除',
                resetSettings: '設定を元に戻す',
                clearAll: 'すべてのデータを削除',
              },
              dialogs: {
                clearGameSave: 'すべてのセーブデータを削除しますか？',
                resetSettings: '設定を元に戻しますか？',
                clearAll: 'すべてのデータを削除しますか？',
              },
            },
            gameSave: {
              title: 'セーブデータと設定のインポートとエクスポート',
              options: {
                export: 'セーブデータと設定のエクスポート',
                import: 'セーブデータと設定のインポート',
              },
              dialogs: {
                import: {
                  title: 'セーブデータと設定をインポートしますか？',
                  tip: 'セーブデータのインポート',
                  error: 'セーブデータの読み込みに失敗しました',
                },
              },
            },
            about: {
              title: 'WebGAL について',
              subTitle: 'WebGAL: オープンソースのウェブベースビジュアルノベルエンジン',
              version: 'バージョン',
              source: 'ソースコードリポジトリ',
              contributors: '貢献者',
              website: 'ウェブサイト',
            },
          },
        },
        display: {
          title: 'ウィンドウ',
          options: {
            fullScreen: {
              title: 'フルスクリーン',
              options: {
                on: 'オン',
                off: 'オフ',
              },
            },
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
                siYuanSimSun: '源ノ明朝(中国語)',
                SimHei: 'OPPO Sans',
                lxgw: 'LXGW WenKai',
              },
            },
            textboxOpacity: {
              title: 'テキストボックスの不透明度',
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
              text: 'これはテキストボックスのフォントとサイズ、表示速度のプレビューです。上にある設定で変更できます。',
            },
          },
        },
        sound: {
          title: 'サウンド',
          options: {
            volumeMain: { title: 'メイン音量' },
            vocalVolume: { title: 'ボイス音量' },
            bgmVolume: { title: 'BGM 音量' },
            seVolume: { title: '効果音音量' },
            uiSeVolume: { title: 'UI 効果音音量' },
            voiceOption: { title: 'ボイスの中断' },
            voiceStop: { title: '中断する' },
            voiceContinue: { title: '中断しない' },
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
      isOverwrite: 'セーブデータを上書きしますか？',
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
      titleTips: 'タイトル画面に戻りますか？',
    },
  },

  extra: {
    title: '鑑賞モード',
  },
};

export default jp;
