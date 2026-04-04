import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import './StatusBar.scss';

export function StatusBar() {
  const statusBarText = useSelector((state: RootState) => state.stage.statusBarText);
  const showTitle = useSelector((state: RootState) => state.GUI.showTitle);
  const showMenuPanel = useSelector((state: RootState) => state.GUI.showMenuPanel);
  const showExtra = useSelector((state: RootState) => state.GUI.showExtra);

  // 在标题、菜单、鉴赏模式时不显示状态框
  if (showTitle || showMenuPanel || showExtra || !statusBarText) {
    return null;
  }

  return (
    <div className="status-bar">
      <div className="status-bar-content">{statusBarText}</div>
    </div>
  );
}
