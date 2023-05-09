export const jp = {
  // 通用
  common: {
    yes: 'はい',
    no: 'いいえ',
  },

  menu: {
    options: {
      title: '設定',
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
                siYuanSimSun: '四元宋書体',
                SimHei: '黒体',
              },
            },
            textPreview: {
              title: 'テキスト表示プレビュー',
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
      },
    },
  },
};
