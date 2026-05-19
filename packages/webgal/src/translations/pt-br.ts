const ptBr = {
  // Geral
  common: {
    yes: 'Ok',
    no: 'Cancelar',
  },

  menu: {
    options: {
      title: 'OPÇÕES',
      pages: {
        system: {
          title: 'Sistema',
          options: {
            autoSpeed: {
              title: 'Velocidade da reprodução automática',
              options: {
                slow: 'Lenta',
                medium: 'Média',
                fast: 'Rápida',
              },
            },
            language: {
              title: 'Idioma',
            },
            resetData: {
              title: 'Limpar ou reiniciar os dados',
              options: {
                clearGameSave: 'Limpar o salvamento do jogo',
                resetSettings: 'Reiniciar as configurações',
                clearAll: 'Limpar todos os dados',
              },
              dialogs: {
                clearGameSave: 'Tem certeza que deseja limpar o salvamento do jogo?',
                resetSettings: 'Tem certeza que deseja reiniciar todas as configurações?',
                clearAll: 'Tem certeza que deseja limpar todos os dados?',
              },
            },
            gameSave: {
              title: 'Importar ou exportar salvamento do jogo e opções',
              options: {
                export: 'Exportar salvamento do jogo e opções',
                import: 'Importar salvamento do jogo e opções',
              },
              dialogs: {
                import: {
                  title: 'Tem certeza que deseja importar o salvamento do jogo e as opções?',
                  tip: 'Importar salvamento do jogo',
                  error: 'Não foi possível analisar o salvamento do jogo',
                },
              },
            },
            about: {
              title: 'Sobre o WebGAL',
              subTitle: 'WebGAL: Um motor de Novelas Visuais de código aberto baseado na web',
              version: 'Versão',
              source: 'Repositório do código',
              contributors: 'Colaboradores',
              website: 'Site web',
            },
            skipAll: {
              title: 'Modo de salto',
              options: {
                read: 'Leitura',
                all: 'Tudo',
              }
            }
          },
        },
        display: {
          title: 'Exibição',
          options: {
            fullScreen: {
              title: 'Tela inteira',
              options: {
                on: 'ON',
                off: 'OFF',
              },
            },
            textSpeed: {
              title: 'Velocidade do texto',
              options: {
                slow: 'Lenta',
                medium: 'Média',
                fast: 'Rápida',
              },
            },
            textSize: {
              title: 'Tamanho do texto',
              options: {
                small: 'Pequeno',
                medium: 'Médio',
                large: 'Grande',
              },
            },
            textFont: {
              title: 'Fonte do texto',
              options: {
                resourceHanRounded: 'Resource Han Rounded',
                siYuanSimSun: 'Source Han Serif',
                SimHei: 'Sans',
              },
            },
            textboxOpacity: {
              title: 'Opacidade da caixa de texto',
            },
            textPreview: {
              title: 'Prévia da exibição do texto',
              text: "Você está vendo uma prévia da fonte, tamanho e velocidade de exibição do texto. Você pode ajustar as opções acima da forma que achar que fique melhor.",
            },
          },
        },
        sound: {
          title: 'Som',
          options: {
            volumeMain: { title: 'Volume principal' },
            vocalVolume: { title: 'Volume da voz' },
            bgmVolume: { title: 'Volume da música de fundo' },
            seVolume: { title: 'Volume dos efeitos sonoros' },
            uiSeVolume: { title: 'Volume dos efeitos sonoros da interface' },
          },
        },
        // language: {
        //   title: 'Português do Brasil',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SALVAR',
      isOverwrite: 'Tem certeza que deseja sobrescrever este salvamento?',
    },
    loadSaving: {
      title: 'CARREGAR',
    },
    title: {
      title: 'TÍTULO',
    },
    exit: {
      title: 'VOLTAR',
    },
  },

  title: {
    start: {
      title: 'INICIAR',
      subtitle: '',
    },
    continue: {
      title: 'CONTINUAR',
      subtitle: '',
    },
    options: {
      title: 'OPÇÕES',
      subtitle: '',
    },
    load: {
      title: 'CARREGAR',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
    exit: {
      title: 'SAIR',
      subtitle: '',
      tips: 'Deseja realmente sair?',
    },
  },

  gaming: {
    noSaving: 'Sem salvamentos',
    buttons: {
      hide: 'Esconder',
      show: 'Exibir',
      backlog: 'Histórico',
      replay: 'Repetir',
      auto: 'Auto',
      forward: 'Avançar',
      quicklySave: 'Salvar rapidamente',
      quicklyLoad: 'Carregar rapidamente',
      save: 'Salvar',
      load: 'Carregar',
      fullscreen: 'Tela cheia',
      options: 'Opções',
      title: 'Título',
      titleTips: 'Confirma o retorno para a tela de título',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default ptBr;
