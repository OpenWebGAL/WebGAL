import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { IFlowchart, IFlowchartEdge, IFlowchartNode } from '@/Core/Modules/flowchart';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { CloseSmall } from '@icon-park/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './flowchart.module.scss';

const NODE_WIDTH = 190;
const NODE_HEIGHT = 78;
const COL_GAP = 270;
const ROW_GAP = 170;
const MARGIN_X = 90;
const MARGIN_Y = 45;
const CONNECTOR_GAP = 12;

interface LayoutNode extends IFlowchartNode {
  x: number;
  y: number;
}

interface LayoutEdge extends IFlowchartEdge {
  sourceNode: LayoutNode;
  targetNode: LayoutNode;
}

interface ConnectorSegment {
  id: string;
  d: string;
  unlocked: boolean;
  arrow: boolean;
  layerY: number;
}

export const Flowchart = () => {
  const t = useTrans('gaming.flowchart.');
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const GUIStore = useSelector((state: RootState) => state.GUI);
  const isOpen = GUIStore.showFlowchart;
  const [indexHide, setIndexHide] = useState(true);
  const [currentFlowchartId, setCurrentFlowchartId] = useState('');
  const [version, setVersion] = useState(0);
  const timeRef = useRef<ReturnType<typeof setTimeout>>();
  const flowcharts = WebGAL.flowchartManager.getFlowcharts();
  const currentFlowchart = flowcharts.find((e) => e.id === currentFlowchartId) ?? flowcharts[0];
  const layout = useMemo(() => layoutFlowchart(currentFlowchart), [currentFlowchart?.id, version]);

  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    window.addEventListener(WebGAL.flowchartManager.getEventName(), update);
    return () => window.removeEventListener(WebGAL.flowchartManager.getEventName(), update);
  }, []);

  useEffect(() => {
    if (!currentFlowchartId && flowcharts[0]) setCurrentFlowchartId(flowcharts[0].id);
  }, [flowcharts[0]?.id, currentFlowchartId]);

  useEffect(() => {
    if (isOpen) {
      if (timeRef.current) clearTimeout(timeRef.current);
      setIndexHide(false);
    } else {
      timeRef.current = setTimeout(() => setIndexHide(true), 780);
    }
  }, [isOpen]);

  const close = () => {
    playSeClick();
    dispatch(setVisibility({ component: 'showFlowchart', visibility: false }));
    dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
  };

  const jumpToNode = (node: IFlowchartNode) => {
    if (!currentFlowchart || !WebGAL.flowchartManager.isUnlocked(currentFlowchart.id, node.id)) return;
    playSeClick();
    WebGAL.flowchartManager.loadSnapshot(currentFlowchart.id, node.id).then((snapshot) => {
      if (!snapshot) return;
      loadGameFromStageData(snapshot);
      dispatch(setVisibility({ component: 'showFlowchart', visibility: false }));
      dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
    });
  };

  return (
    <div className={`${isOpen ? styles.Flowchart_main : styles.Flowchart_main_out} ${indexHide ? styles.Flowchart_main_out_IndexHide : ''}`}>
      <div className={styles.flowchart_top}>
        <CloseSmall
          className={styles.flowchart_top_icon}
          onClick={close}
          onMouseEnter={playSeEnter}
          theme="outline"
          size="4em"
          fill="#ffffff"
          strokeWidth={3}
        />
        <div className={styles.flowchart_title}>{t('title')}</div>
      </div>
      {isOpen && (
        <div className={styles.flowchart_body}>
          <div className={styles.flowchart_sidebar}>
            {flowcharts.map((flowchart) => (
              <button
                type="button"
                key={flowchart.id}
                className={`${styles.flowchart_tab} ${currentFlowchart?.id === flowchart.id ? styles.flowchart_tab_active : ''}`}
                onClick={() => {
                  playSeClick();
                  setCurrentFlowchartId(flowchart.id);
                }}
                onMouseEnter={playSeEnter}
              >
                {flowchart.name}
              </button>
            ))}
          </div>
          <div className={styles.flowchart_content}>
            {!currentFlowchart ? (
              <div className={styles.flowchart_empty}>{t('empty')}</div>
            ) : (
              <svg
                className={styles.flowchart_canvas}
                width={layout.width}
                height={layout.height}
                viewBox={`0 0 ${layout.width} ${layout.height}`}
              >
                <defs>
                  <marker
                    id="flowchart-arrow-unlocked"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path className={styles.flowchart_arrow_unlocked} d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                  <marker
                    id="flowchart-arrow-locked"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="5"
                    markerHeight="5"
                    orient="auto-start-reverse"
                  >
                    <path className={styles.flowchart_arrow_locked} d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>
                {getConnectorSegments(layout.edges, currentFlowchart.id)
                  .sort((a, b) => b.layerY - a.layerY)
                  .map((segment) => (
                    <path
                      key={segment.id}
                      className={segment.unlocked ? styles.flowchart_line_unlocked : styles.flowchart_line_locked}
                      d={segment.d}
                      markerEnd={
                        segment.arrow ? `url(#${segment.unlocked ? 'flowchart-arrow-unlocked' : 'flowchart-arrow-locked'})` : undefined
                      }
                    />
                  ))}
                {layout.nodes.map((node) => {
                  const unlocked = WebGAL.flowchartManager.isUnlocked(currentFlowchart.id, node.id);
                  const labelText = unlocked ? node.data?.label || node.id : t('locked');
                  return (
                    <g
                      key={node.id}
                      className={`${styles.flowchart_node} ${unlocked ? styles.flowchart_node_unlocked : styles.flowchart_node_locked}`}
                      role={unlocked ? 'button' : undefined}
                      tabIndex={unlocked ? 0 : -1}
                      onClick={() => unlocked && jumpToNode(node)}
                      onKeyDown={(event) => {
                        if (unlocked && (event.key === 'Enter' || event.key === ' ')) jumpToNode(node);
                      }}
                      onMouseEnter={unlocked ? playSeEnter : undefined}
                    >
                      <title>{labelText}</title>
                      <rect
                        className={`${styles.flowchart_node_rect} ${
                          unlocked ? styles.flowchart_node_rect_unlocked : styles.flowchart_node_rect_locked
                        }`}
                        x={node.x}
                        y={node.y}
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx="7"
                      />
                      <text className={styles.flowchart_node_label} x={node.x + 12} y={node.y + NODE_HEIGHT / 2} dominantBaseline="middle">
                        {truncateText(labelText, 10)}
                      </text>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function layoutFlowchart(flowchart?: IFlowchart) {
  if (!flowchart) return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 0, height: 0 };
  const nodeMap = new Map(flowchart.nodes.map((node) => [node.id, node]));
  const validEdges = flowchart.edges.filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target));
  const incomingCount = new Map(flowchart.nodes.map((node) => [node.id, 0]));
  const adjacency = new Map<string, IFlowchartEdge[]>();
  const parentMap = new Map<string, string[]>();
  validEdges.forEach((edge) => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge]);
    parentMap.set(edge.target, [...(parentMap.get(edge.target) ?? []), edge.source]);
  });
  const roots = flowchart.nodes.filter((node) => node.data?.isRoot || (incomingCount.get(node.id) ?? 0) === 0);
  const queue = (roots.length ? roots : flowchart.nodes.slice(0, 1)).map((node) => node.id);
  const restIncomingCount = new Map(incomingCount);
  const depthMap = new Map(flowchart.nodes.map((node) => [node.id, 0]));
  const visited = new Set<string>();
  while (queue.length > 0) {
    const sourceId = queue.shift()!;
    if (visited.has(sourceId)) continue;
    visited.add(sourceId);
    (adjacency.get(sourceId) ?? []).forEach((edge) => {
      depthMap.set(edge.target, Math.max(depthMap.get(edge.target) ?? 0, (depthMap.get(sourceId) ?? 0) + 1));
      restIncomingCount.set(edge.target, (restIncomingCount.get(edge.target) ?? 0) - 1);
      if ((restIncomingCount.get(edge.target) ?? 0) <= 0) queue.push(edge.target);
    });
  }
  const maxDepth = Math.max(0, ...depthMap.values());
  flowchart.nodes
    .filter((node) => !visited.has(node.id))
    .forEach((node, index) => depthMap.set(node.id, Math.max(depthMap.get(node.id) ?? 0, maxDepth + index + 1)));
  const layerMap = new Map<number, IFlowchartNode[]>();
  flowchart.nodes.forEach((node) => {
    const depth = depthMap.get(node.id) ?? 0;
    layerMap.set(depth, [...(layerMap.get(depth) ?? []), node]);
  });
  const layers = [...layerMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, layer]) => layer);
  const maxCols = Math.max(1, ...layers.map((layer) => layer.length));
  const width = MARGIN_X * 2 + NODE_WIDTH + (maxCols - 1) * COL_GAP;
  const layoutNodeMap = new Map<string, LayoutNode>();
  layers.forEach((layer, depth) => {
    const layerWidth = NODE_WIDTH + (layer.length - 1) * COL_GAP;
    layer.forEach((node, index) => {
      const parentXs = (parentMap.get(node.id) ?? []).map((id) => layoutNodeMap.get(id)?.x).filter((x): x is number => typeof x === 'number');
      layoutNodeMap.set(node.id, {
        ...node,
        x: layer.length === 1 && parentXs.length > 0 ? parentXs.reduce((sum, x) => sum + x, 0) / parentXs.length : (width - layerWidth) / 2 + index * COL_GAP,
        y: MARGIN_Y + depth * ROW_GAP,
      });
    });
  });
  const nodes = [...layoutNodeMap.values()];
  const edges = validEdges
    .map((edge) => ({ ...edge, sourceNode: layoutNodeMap.get(edge.source), targetNode: layoutNodeMap.get(edge.target) }))
    .filter((edge): edge is LayoutEdge => Boolean(edge.sourceNode && edge.targetNode));
  return { nodes, edges, width, height: MARGIN_Y * 2 + NODE_HEIGHT + (layers.length - 1) * ROW_GAP };
}

function getConnectorSegments(edges: LayoutEdge[], flowchartId: string): ConnectorSegment[] {
  const edgeGroups = new Map<string, LayoutEdge[]>();
  edges.forEach((edge) => edgeGroups.set(edge.source, [...(edgeGroups.get(edge.source) ?? []), edge]));
  return [...edgeGroups.values()].flatMap((groupEdges) => getConnectorSegmentsBySource(groupEdges, flowchartId));
}

function getConnectorSegmentsBySource(edges: LayoutEdge[], flowchartId: string): ConnectorSegment[] {
  if (edges.length === 0) return [];
  const source = edges[0].sourceNode;
  const sx = source.x + NODE_WIDTH / 2;
  const sy = source.y + NODE_HEIGHT;
  const sourceUnlocked = WebGAL.flowchartManager.isUnlocked(flowchartId, source.id);
  if (edges.length === 1) {
    const edge = edges[0];
    const tx = edge.targetNode.x + NODE_WIDTH / 2;
    const ty = edge.targetNode.y - CONNECTOR_GAP;
    const midY = sy + Math.max(30, (ty - sy) / 2);
    return [
      {
        id: edge.id,
        d: sx === tx ? `M ${sx} ${sy} V ${ty}` : `M ${sx} ${sy} V ${midY} H ${tx} V ${ty}`,
        unlocked: sourceUnlocked && WebGAL.flowchartManager.isUnlocked(flowchartId, edge.target),
        arrow: true,
        layerY: ty,
      },
    ];
  }
  const targetXs = edges.map((edge) => edge.targetNode.x + NODE_WIDTH / 2);
  const targetY = Math.min(...edges.map((edge) => edge.targetNode.y)) - CONNECTOR_GAP;
  const busY = sy + Math.max(34, (targetY - sy) / 2);
  const hasUnlockedTarget = edges.some((edge) => WebGAL.flowchartManager.isUnlocked(flowchartId, edge.target));
  const segments: ConnectorSegment[] = [
    { id: `${source.id}-trunk`, d: `M ${sx} ${sy} V ${busY}`, unlocked: sourceUnlocked && hasUnlockedTarget, arrow: false, layerY: busY },
    {
      id: `${source.id}-bus`,
      d: `M ${Math.min(...targetXs)} ${busY} H ${Math.max(...targetXs)}`,
      unlocked: sourceUnlocked && hasUnlockedTarget,
      arrow: false,
      layerY: busY,
    },
  ];
  edges.forEach((edge) => {
    const tx = edge.targetNode.x + NODE_WIDTH / 2;
    segments.push({
      id: edge.id,
      d: `M ${tx} ${busY} V ${edge.targetNode.y - CONNECTOR_GAP}`,
      unlocked: sourceUnlocked && WebGAL.flowchartManager.isUnlocked(flowchartId, edge.target),
      arrow: true,
      layerY: edge.targetNode.y - CONNECTOR_GAP,
    });
  });
  return segments;
}

function truncateText(text: string | undefined, maxLength: number) {
  const safeText = text ?? '';
  return safeText.length > maxLength ? `${safeText.slice(0, maxLength)}...` : safeText;
}
