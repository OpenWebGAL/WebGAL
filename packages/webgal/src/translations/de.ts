const de = {
  // 通用
  common: {
    yes: 'Ja',
    no: 'Nein',
  },

  menu: {
    options: {
      title: 'OPTIONEN',
      pages: {
        system: {
          title: 'System',
          options: {
            autoSpeed: {
              title: 'Auto-Geschwindigkeit',
              options: {
                slow: 'Langsam',
                medium: 'Normal',
                fast: 'Schnell',
              },
            },
            language: {
              title: 'Sprache',
            },
            resetData: {
              title: 'Daten löschen oder zurücksetzen',
              options: {
                clearGameSave: 'Alle Spielstände löschen',
                resetSettings: 'Alle Einstellungen zurücksetzen',
                clearAll: 'Alle Daten löschen',
              },
              dialogs: {
                clearGameSave: 'Sind Sie sicher, dass Sie den Spielstand löschen möchten?',
                resetSettings: 'Sind Sie sicher, dass Sie alle Einstellungen zurücksetzen möchten?',
                clearAll: 'Sind Sie sicher, dass Sie alle Daten löschen möchten?',
              },
            },
            gameSave: {
              title: 'Spielstand und Optionen importieren oder exportieren',
              options: {
                export: 'Spielstand und Optionen exportieren',
                import: 'Spielstand und Optionen importieren',
              },
              dialogs: {
                import: {
                  title: 'Sind Sie sicher, dass Sie den Spielstand und die Optionen importieren möchten?',
                  tip: 'Spielstand importieren',
                  error: 'Ein Fehler ist beim Analysieren des Spielstands aufgetreten',
                },
              },
            },
            about: {
              title: 'Über WebGAL',
              subTitle: 'WebGAL: Eine Open-Source Web-Based Visual Novel Engine',
              version: 'Version',
              source: 'Source Code Repository',
              contributors: 'Contributors',
              website: 'Website',
            },
          },
        },
        display: {
          title: 'Darstellung',
          options: {
            textSpeed: {
              title: 'Geschwindigkeit der Textanzeige',
              options: {
                slow: 'Langsam',
                medium: 'Normal',
                fast: 'Schnell',
              },
            },
            textSize: {
              title: 'Textgröße',
              options: {
                small: 'Klein',
                medium: 'Normal',
                large: 'Groß',
              },
            },
            textFont: {
              title: 'Schriftart',
              options: {
                siYuanSimSun: 'Source Han Serif',
                SimHei: 'Sans',
                lxgw: 'LXGW WenKai',
              },
            },
            textboxOpacity: {
              title: 'Textbox Opacity',
            },
            textPreview: {
              title: 'Vorschautext wird angezeigt',
              text: 'Sie können jederzeit die Schriftart, Größe und Wiedergabegeschwindigkeit des Textes nach Ihrer Vorliebe anpassen.',
            },
          },
        },
        sound: {
          title: 'Ton',
          options: {
            volumeMain: { title: 'Hauptlautstärke' },
            vocalVolume: { title: 'Stimmlautstärke' },
            bgmVolume: { title: 'Musiklautstärke' },
            seVolume: { title: 'Soundeffektlautstärke' },
            uiSeVolume: { title: 'UI Soundeffektlautstärke' },
          },
        },
        // language: {
        //   title: 'Sprache',
        //   options: {
        //   },
        // },
      },
    },
    saving: {
      title: 'SPEICHERN',
      isOverwrite: 'Sind Sie sicher, dass Sie diesen Spielstand überschreiben möchten?',
    },
    loadSaving: {
      title: 'LADEN',
    },
    title: {
      title: 'TITEL',
    },
    exit: {
      title: 'ZURÜCK',
    },
  },

  title: {
    start: {
      title: 'STARTEN',
      subtitle: '',
    },
    continue: {
      title: 'WEITERLESEN',
      subtitle: '',
    },
    options: {
      title: 'OPTIONEN',
      subtitle: '',
    },
    load: {
      title: 'LADEN',
      subtitle: '',
    },
    extra: {
      title: 'EXTRA',
      subtitle: '',
    },
  },

  gaming: {
    noSaving: 'Keine Speicherung',
    buttons: {
      hide: 'Verstecken',
      show: 'Anzeigen',
      backlog: 'Verlauf',
      replay: 'Wiedergabe',
      auto: 'Auto',
      forward: 'Überspringen',
      quicklySave: 'Quickly Save',
      quicklyLoad: 'Quickly Load',
      save: 'Speichern',
      load: 'Laden',
      options: 'Optionen',
      title: 'Titel',
    },
  },

  extra: {
    title: 'EXTRA',
  },
};

export default de;
