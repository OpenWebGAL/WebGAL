const zhCn = {
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
            language: {
              title: '语言',
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
            about: {
              title: '关于 WebGAL',
              subTitle: 'WebGAL：开源的网页端视觉小说引擎',
              version: '版本号',
              source: '源代码仓库',
              contributors: '贡献者',
              website: '网站',
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
                lxgw: '霞鹜文楷',
              },
            },
            textPreview: {
              title: '文本显示预览',
              text: '现在预览的是文本框字体大小和播放速度的情况，您可以根据您的观感调整上面的选项。',
            },
          },
        },
        sound: {
          title: '音频',
          options: {
            volumeMain: { title: '主音量' },
            vocalVolume: { title: '语音音量' },
            bgmVolume: { title: '背景音乐音量' },
            seVolume: { title: '音效音量' },
            uiSeVolume: { title: '用户界面音效音量' },
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
      title: '存档',
      isOverwrite: '是否覆盖存档？',
    },
    loadSaving: {
      title: '读档',
    },
    title: {
      title: '标题',
      options: {
        load: '',
        extra: '鉴赏模式',
      },
    },
    exit: {
      title: '返回',
    },
  },

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

export default zhCn;
