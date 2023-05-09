export const zhCn = {
  // 通用
  common: {
    yes: '是',
    no: '否',
  },

  menu: {
    options: {
      title: '选项',
      pages: {
        system: {
          title: '系统',
          options: {
            autoSpeed: {
              title: '自动播放速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            resetData: {
              title: '清除或还原数据',
              options: {
                clearGameSave: '清除所有存档',
                resetSettings: '还原默认设置',
                clearAll: '清除所有数据',
              },
              dialogs: {
                clearGameSave: '确定要清除存档吗',
                resetSettings: '确定要还原默认设置吗',
                clearAll: '确定要清除所有数据吗',
              },
            },
            gameSave: {
              title: '导入或导出存档与选项',
              options: {
                export: '导出存档与选项',
                import: '导入存档与选项',
              },
              dialogs: {
                import: {
                  title: '确定要导入存档与选项吗',
                  tip: '导入存档',
                  error: '存档解析失败',
                },
              },
            },
          },
        },
        display: {
          title: '显示',
          options: {
            textSpeed: {
              title: '文字显示速度',
              options: {
                slow: '慢',
                medium: '中',
                fast: '快',
              },
            },
            textSize: {
              title: '文本大小',
              options: {
                small: '小',
                medium: '中',
                large: '大',
              },
            },
            textFont: {
              title: '文本字体',
              options: {
                siYuanSimSun: '思源宋体',
                SimHei: '黑体',
              },
            },
            textPreview: {
              title: '文本显示预览',
            },
          },
        },
        sound: {
          title: '音频',
          options: {
            volumeMain: { title: '主音量' },
            vocalVolume: { title: '语音音量' },
            bgmVolume: { title: '背景音乐音量' },
          },
        },
      },
    },
  },
};
