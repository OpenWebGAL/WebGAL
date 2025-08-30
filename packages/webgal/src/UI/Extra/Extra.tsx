import styles from './extra.module.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { setVisibility } from '@/store/GUIReducer';
import { CloseSmall, Filter, HamburgerButton, Left, Music, Pic } from '@icon-park/react';
import { ExtraBgm } from '@/UI/Extra/ExtraBgm';
import { ExtraCg } from './ExtraCg';
import useTrans from '@/hooks/useTrans';
import useSoundEffect from '@/hooks/useSoundEffect';
import useApplyStyle from '@/hooks/useApplyStyle';
import { useDelayedVisibility } from '@/hooks/useDelayedVisibility';
import { useEffect, useState } from 'react';
import { Icon } from '@icon-park/react/lib/runtime';
import { IAppreciationAsset } from '@/store/userDataInterface';

enum ExtraType {
  CG,
  BGM,
}

export interface IExtraOption {
  series: string;
}

interface IExtraBarButtonProps {
  text?: string;
  icon?: Icon;
  active?: boolean;
  onClick?: () => void;
}

interface IExtraSeriesButtonProps {
  text: string;
  active?: boolean;
  onClick?: () => void;
}

export function Extra() {
  const { playSeClick, playSeEnter } = useSoundEffect();
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);
  const dispatch = useDispatch();
  const applyStyle = useApplyStyle('UI/Extra/extra.scss');
  const t = useTrans('extra.');
  const optionData = useSelector((state: RootState) => state.userData.optionData);
  const [extraType, setExtraType] = useState<ExtraType>(ExtraType.CG);

  // 当前CG系列和BGM系列, 空字符串表示显示全部
  const [currentCgSeries, setCurrentCgSeries] = useState<string>('');
  const [currentBgmSeries, setCurrentBgmSeries] = useState<string>('');

  // 所有CG系列和BGM系列
  const [cgSeries, setCgSeries] = useState<string[]>([]);
  const [bgmSeries, setBgmSeries] = useState<string[]>([]);

  // 每次打开Extra时，遍历appreciationData，提取所有series
  const appreciationData = useSelector((state: RootState) => state.userData.appreciationData);

  // 仅在showExtra变为true时重新计算series
  useEffect(() => {
    if (showExtra && appreciationData) {
      // 提取CG系列
      const cgSet = new Set<string>();
      appreciationData.cg?.forEach((item) => {
        if (item.series) {
          cgSet.add(item.series);
        }
      });
      setCgSeries(Array.from(cgSet));

      // 提取BGM系列
      const bgmSet = new Set<string>();
      appreciationData.bgm?.forEach((item) => {
        if (item.series) bgmSet.add(item.series);
      });
      setBgmSeries(Array.from(bgmSet));
    }
  }, [showExtra, appreciationData]);

  const extraBarButton = (props: IExtraBarButtonProps) => {
    return (
      <div
        className={`${applyStyle('extra_bar_button', styles.extra_bar_button)} ${
          props.active ? applyStyle('extra_bar_button_active', styles.extra_bar_button_active) : ''
        }`}
        onClick={props.onClick}
        onMouseEnter={playSeEnter}
      >
        {props.icon && (
          <props.icon className={applyStyle('extra_bar_button_icon', styles.extra_bar_button_icon)} strokeWidth={4} />
        )}
        {props.text && (
          <div className={applyStyle('extra_bar_button_text', styles.extra_bar_button_text)}>{props.text}</div>
        )}
      </div>
    );
  };

  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const delayedShowFilterPanel = useDelayedVisibility(showFilterPanel);
  const extraSeriesButton = (props: IExtraSeriesButtonProps) => {
    return (
      <div
        className={`${applyStyle('extra_filter_panel_list_button', styles.extra_filter_panel_list_button)} ${
          props.active
            ? applyStyle('extra_filter_panel_list_button_active', styles.extra_filter_panel_list_button_active)
            : ''
        }`}
        onClick={props.onClick}
      >
        {props.text === 'default' ? t('defaultSeries') : props.text}
      </div>
    );
  };

  const useFilterTitle = () => {
    if (extraType === ExtraType.CG) {
      if (currentCgSeries === '') {
        return t('title');
      } else {
        if (currentCgSeries === 'default') {
          return t('defaultSeries');
        } else {
          return currentCgSeries;
        }
      }
    } else if (extraType === ExtraType.BGM) {
      if (currentBgmSeries === '') {
        return t('title');
      } else {
        if (currentBgmSeries === 'default') {
          return t('defaultSeries');
        } else {
          return currentBgmSeries;
        }
      }
    }
    return t('title');
  };

  const delayedShowExtra = useDelayedVisibility(showExtra);

  return (
    <>
      {delayedShowExtra && (
        <div
          className={`${applyStyle('extra_main', styles.extra_main)} ${
            showExtra ? '' : applyStyle('extra_main_hide', styles.extra_main_hide)
          }`}
          style={{ ['--ui-transition-duration' as any]: `${optionData.uiTransitionDuration}ms` }}
        >
          <div className={applyStyle('extra_bar', styles.extra_bar)}>
            {extraBarButton({
              icon: Left,
              onClick: () => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              },
            })}
            {extraBarButton({
              icon: HamburgerButton,
              text: useFilterTitle(),
              onClick: () => {
                setShowFilterPanel((prev) => !prev);
              },
            })}
            {extraBarButton({
              icon: Pic,
              text: t('cg'),
              active: extraType === ExtraType.CG,
              onClick: () => {
                setExtraType(ExtraType.CG);
              },
            })}
            {extraBarButton({
              icon: Music,
              text: t('bgm'),
              active: extraType === ExtraType.BGM,
              onClick: () => {
                setExtraType(ExtraType.BGM);
              },
            })}
            {/* <Left
              className={applyStyle('extra_top_icon', styles.extra_top_icon)}
              onClick={() => {
                dispatch(setVisibility({ component: 'showExtra', visibility: false }));
                playSeClick();
              }}
              onMouseEnter={playSeClick}
              strokeWidth={4}
            />
            <div className={applyStyle('extra_title', styles.extra_title)}>{t('title')}</div> */}
          </div>
          <div className={applyStyle('extra_container', styles.extra_container)}>
            {extraType === ExtraType.CG && <ExtraCg series={currentCgSeries} />}
            {extraType === ExtraType.BGM && <ExtraBgm series={currentBgmSeries} />}
          </div>
          {delayedShowFilterPanel && (
            <div
              className={`${applyStyle('extra_filter_panel', styles.extra_filter_panel)} ${
                showFilterPanel ? '' : applyStyle('extra_filter_panel_hide', styles.extra_filter_panel_hide)
              }`}
              onClick={() => setShowFilterPanel(false)}
            >
              <div
                className={applyStyle('extra_filter_panel_list', styles.extra_filter_panel_list)}
                onClick={
                  // 阻止点击事件传递到 extra_filter_panel
                  (e) => e.stopPropagation()
                }
              >
                {extraType === ExtraType.CG &&
                  cgSeries.map((series) =>
                    extraSeriesButton({
                      text: series,
                      active: currentCgSeries === series,
                      onClick: () => {
                        if (currentCgSeries === series) {
                          setCurrentCgSeries('');
                        } else {
                          setCurrentCgSeries(series);
                        }
                        setShowFilterPanel(false);
                      },
                    }),
                  )}
                {extraType === ExtraType.BGM &&
                  bgmSeries.map((series) =>
                    extraSeriesButton({
                      text: series,
                      active: currentBgmSeries === series,
                      onClick: () => {
                        if (currentBgmSeries === series) {
                          setCurrentBgmSeries('');
                        } else {
                          setCurrentBgmSeries(series);
                        }
                        setShowFilterPanel(false);
                      },
                    }),
                  )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
