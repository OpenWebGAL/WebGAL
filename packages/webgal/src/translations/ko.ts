const ko = {
  // 공통
  common: {
    yes: '네',
    no: '아니요',
  },

  menu: {
    options: {
      title: '설정',
      pages: {
        system: {
          title: '시스템',
          options: {
            autoSpeed: {
              title: '자동진행 속도',
              options: {
                slow: '느림',
                medium: '중간',
                fast: '빠름',
              },
            },
            language: {
              title: '언어',
            },
            resetData: {
              title: '데이터 삭제 및 복구',
              options: {
                clearGameSave: '모든 저장 데이터를 삭제',
                resetSettings: '초기 설정으로 되돌리기',
                clearAll: '데이터 초기화',
              },
              dialogs: {
                clearGameSave: '이 저장 데이터를 정말로 삭제하시겠습니까?',
                resetSettings: '초기 설정으로 되돌리시겠습니까?',
                clearAll: '모든 데이터를 삭제하시겠습니까?',
              },
            },
            gameSave: {
              title: '데이터 불러오기 및 내보내기',
              options: {
                export: '저장 데이터 및 선택지 내보내기',
                import: '저장 데이터 및 선택지 불러오기',
              },
              dialogs: {
                import: {
                  title: '저장 데이터와 선택지를 불러오겠습니까?',
                  tip: '저장 데이터 불러오기',
                  error: '데이터 분석 실패',
                },
              },
            },
            about: {
              title: 'WebGAL에 관하여',
              subTitle: 'WebGAL: 오픈 소스 웹 기반 비주얼 노벨 엔진',
              version: '버전 이름',
              source: '소스 코드 저장소',
              contributors: '기여자',
              website: '홈페이지',
            },
            skipAll: {
              title: '빠른 재생',
              options: {
                read: '읽은 부분',
                all: '전부',
              }
            }
          },
        },
        display: {
          title: '화면 설정',
          options: {
            fullScreen: {
              title: '전체 화면 모드',
              options: {
                on: '열기',
                off: '끄기',
              },
            },
            textSpeed: {
              title: '텍스트 표시 속도',
              options: {
                slow: '천천히',
                medium: '보통',
                fast: '빠르게',
              },
            },
            textSize: {
              title: '텍스트 크기',
              options: {
                small: '소',
                medium: '중',
                large: '대',
              },
            },
            textFont: {
              title: '텍스트 폰트',
              options: {
                resourceHanRounded: '본고딕',
                siYuanSimSun: '본명조',
                SimHei: '黑体',
              },
            },
            textboxOpacity: {
              title: '텍스트 창 불투명도',
            },
            textPreview: {
              title: '텍스트 미리보기',
              text: '현재 뜨는 것은 텍스트 창의 글자 크기와 재생속도의 미리보기이며, 본 설정은 플레이어에 의해 조절할 수 있습니다.',
            },
          },
        },
        sound: {
          title: '사운드',
          options: {
            volumeMain: { title: '마스터 음량' },
            vocalVolume: { title: '보이스 음량' },
            bgmVolume: { title: 'BGM 음량' },
            seVolume: { title: '효과음 음량' },
            uiSeVolume: { title: '유저 인터페이스 효과음 음량' },
            voiceOption: { title: '보이스를 멈추시겠습니까?' },
            voiceStop: { title: '보이스 정지' },
            voiceContinue: { title: '보이스 재생' },
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
      title: '저장',
      isOverwrite: '기존 데이터를 덮어쓰시겠습니까?',
    },
    loadSaving: {
      title: '불러오기',
    },
    flowchart: {
      title: '플로차트',
    },
    title: {
      title: '타이틀',
      options: {
        load: '',
        extra: '갤러리',
      },
    },
    exit: {
      title: '뒤로가기',
    },
  },

  title: {
    start: {
      title: '게임 시작하기',
      subtitle: 'START',
    },
    continue: {
      title: '이어서 플레이',
      subtitle: 'CONTINUE',
    },
    options: {
      title: '설정',
      subtitle: 'OPTIONS',
    },
    load: {
      title: '불러오기',
      subtitle: 'LOAD',
    },
    extra: {
      title: '갤러리',
      subtitle: 'EXTRA',
    },
    exit: {
      title: '게임 종료',
      subtitle: 'EXIT',
      tips: '게임을 종료하시겠습니까?',
    },
  },

  gaming: {
    noSaving: '세이브 데이터 없음',
    buttons: {
      hide: '숨김',
      show: '표시',
      backlog: '백로그',
      flowchart: '플로차트',
      replay: '다시 재생',
      auto: '자동 재생',
      forward: '빠른 재생',
      quicklySave: '빠른 저장',
      quicklyLoad: '빠른 불러오기',
      save: '저장',
      load: '불러오기',
      fullscreen: '전체 화면',
      options: '옵션',
      title: '메인 화면',
      titleTips: '메인 화면으로 돌아가시겠습니까?',
    },
    flowchart: {
      title: '플로차트',
      empty: '플로차트 없음',
      locked: '잠김',
      main: '메인',
      character: '루트',
      root: '시작',
      chapter: '챕터',
    },
  },

  extra: {
    title: '갤러리',
  },
};

export default ko;
