import { loadGameFromStageData } from '@/Core/controller/storage/loadGame';
import { IFlowchart, IFlowchartEdge, IFlowchartNode } from '@/Core/Modules/flowchart';
import { WebGAL } from '@/Core/WebGAL';
import useSoundEffect from '@/hooks/useSoundEffect';
import useTrans from '@/hooks/useTrans';
import { setVisibility } from '@/store/GUIReducer';
import { RootState } from '@/store/store';
import { MouseEvent as ReactMouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './flowchart.module.scss';

const NODE_MIN_WIDTH = 190;
const NODE_HEIGHT = 78;
const NODE_GAP = 80;
const ROW_GAP = 170;
const MARGIN_X = 90;
const MARGIN_Y = 45;
const CONNECTOR_GAP = 12;

interface LayoutNode extends IFlowchartNode {
  x: number;
  y: number;
  width: number;
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

type LockedNodeVisibility = 'all' | 'node' | 'none';

export const Flowchart = () => {
  const t = useTrans('gaming.flowchart.');
  const { playSeClick, playSeEnter } = useSoundEffect();
  const dispatch = useDispatch();
  const lockedNodeVisibility = useSelector((state: RootState) =>
    normalizeLockedNodeVisibility(state.userData.globalGameVar.Flowchart_Locked_Node_Visibility),
  );
  const [currentFlowchartId, setCurrentFlowchartId] = useState('');
  const [version, setVersion] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ moved: false, scrollLeft: 0, scrollTop: 0, startX: 0, startY: 0 });
  const blockClickRef = useRef(false);
  const flowcharts = WebGAL.flowchartManager.getFlowcharts();
  const currentFlowchart = flowcharts.find((e) => e.id === currentFlowchartId) ?? flowcharts[0];
  const layout = useMemo(
    () => layoutFlowchart(currentFlowchart, lockedNodeVisibility),
    [currentFlowchart?.id, lockedNodeVisibility, version],
  );

  useEffect(() => {
    const update = () => setVersion((v) => v + 1);
    window.addEventListener(WebGAL.flowchartManager.getEventName(), update);
    return () => window.removeEventListener(WebGAL.flowchartManager.getEventName(), update);
  }, []);

  useEffect(() => {
    if (!currentFlowchartId && flowcharts[0]) setCurrentFlowchartId(flowcharts[0].id);
  }, [flowcharts[0]?.id, currentFlowchartId]);

  const jumpToNode = (node: IFlowchartNode) => {
    if (blockClickRef.current) {
      blockClickRef.current = false;
      return;
    }
    if (!currentFlowchart || !WebGAL.flowchartManager.isUnlocked(currentFlowchart.id, node.id)) return;
    playSeClick();
    WebGAL.flowchartManager.loadSnapshot(currentFlowchart.id, node.id).then((snapshot) => {
      if (!snapshot) return;
      loadGameFromStageData(snapshot);
      dispatch(setVisibility({ component: 'showMenuPanel', visibility: false }));
      dispatch(setVisibility({ component: 'showTextBox', visibility: true }));
    });
  };

  const dragFlowchart = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const target = event.currentTarget;
    dragStateRef.current = {
      moved: false,
      scrollLeft: target.scrollLeft,
      scrollTop: target.scrollTop,
      startX: event.clientX,
      startY: event.clientY,
    };
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - dragStateRef.current.startX;
      const dy = moveEvent.clientY - dragStateRef.current.startY;
      if (!dragStateRef.current.moved && Math.abs(dx) + Math.abs(dy) > 3) {
        dragStateRef.current.moved = true;
        blockClickRef.current = true;
        setIsDragging(true);
      }
      target.scrollLeft = dragStateRef.current.scrollLeft - dx;
      target.scrollTop = dragStateRef.current.scrollTop - dy;
    };
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
      if (dragStateRef.current.moved) {
        window.setTimeout(() => {
          blockClickRef.current = false;
        }, 0);
      }
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    event.preventDefault();
  };

  return (
    <div className={styles.Flowchart_main}>
      <div className={styles.flowchart_top}>
        <div className={styles.flowchart_title}>
          <div className={styles.flowchart_title_text}>{t('title')}</div>
        </div>
      </div>
      <div className={styles.flowchart_body}>
        <div className={styles.flowchart_sidebar}>
          {flowcharts.map((flowchart) => (
            <button
              type="button"
              key={flowchart.id}
              className={`${styles.flowchart_tab} ${
                currentFlowchart?.id === flowchart.id ? styles.flowchart_tab_active : ''
              }`}
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
        <div
          className={`${styles.flowchart_content} ${isDragging ? styles.flowchart_content_dragging : ''}`}
          onMouseDown={dragFlowchart}
        >
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
                <linearGradient id="flowchart-node-unlocked" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="58%" stopColor="#f8fbfc" />
                  <stop offset="100%" stopColor="#e4f0f5" />
                </linearGradient>
                <linearGradient id="flowchart-node-locked" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f0f5f7" />
                </linearGradient>
                <filter id="flowchart-node-glow" x="-20%" y="-35%" width="140%" height="170%">
                  <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2B5F75" floodOpacity="0.28" />
                </filter>
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
                      segment.arrow
                        ? `url(#${segment.unlocked ? 'flowchart-arrow-unlocked' : 'flowchart-arrow-locked'})`
                        : undefined
                    }
                  />
                ))}
              {layout.nodes.map((node) => {
                const unlocked = WebGAL.flowchartManager.isUnlocked(currentFlowchart.id, node.id);
                const labelText = unlocked || lockedNodeVisibility === 'all' ? node.data?.label || node.id : '';
                return (
                  <g
                    key={node.id}
                    className={`${styles.flowchart_node} ${
                      unlocked ? styles.flowchart_node_unlocked : styles.flowchart_node_locked
                    }`}
                    role={unlocked ? 'button' : undefined}
                    tabIndex={unlocked ? 0 : -1}
                    onClick={() => unlocked && jumpToNode(node)}
                    onKeyDown={(event) => {
                      if (unlocked && (event.key === 'Enter' || event.key === ' ')) jumpToNode(node);
                    }}
                    onMouseEnter={unlocked ? playSeEnter : undefined}
                  >
                    <title>{labelText || t('locked')}</title>
                    <rect
                      className={`${styles.flowchart_node_rect} ${
                        unlocked ? styles.flowchart_node_rect_unlocked : styles.flowchart_node_rect_locked
                      }`}
                      x={node.x}
                      y={node.y}
                      width={node.width}
                      height={NODE_HEIGHT}
                      rx="8"
                    />
                    <text
                      className={styles.flowchart_node_label}
                      x={node.x + 12}
                      y={node.y + NODE_HEIGHT / 2}
                      dominantBaseline="middle"
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

function layoutFlowchart(flowchart?: IFlowchart, lockedNodeVisibility: LockedNodeVisibility = 'node') {
  if (!flowchart) return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 0, height: 0 };
  const flowchartNodes =
    lockedNodeVisibility === 'none'
      ? flowchart.nodes.filter((node) => WebGAL.flowchartManager.isUnlocked(flowchart.id, node.id))
      : flowchart.nodes;
  if (flowchartNodes.length === 0) return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 0, height: 0 };
  const nodeMap = new Map(flowchartNodes.map((node) => [node.id, node]));
  const validEdges = flowchart.edges.filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target));
  const incomingCount = new Map(flowchartNodes.map((node) => [node.id, 0]));
  const adjacency = new Map<string, IFlowchartEdge[]>();
  const parentMap = new Map<string, string[]>();
  validEdges.forEach((edge) => {
    incomingCount.set(edge.target, (incomingCount.get(edge.target) ?? 0) + 1);
    adjacency.set(edge.source, [...(adjacency.get(edge.source) ?? []), edge]);
    parentMap.set(edge.target, [...(parentMap.get(edge.target) ?? []), edge.source]);
  });
  const roots = flowchartNodes.filter((node) => node.data?.isRoot || (incomingCount.get(node.id) ?? 0) === 0);
  const queue = (roots.length ? roots : flowchartNodes.slice(0, 1)).map((node) => node.id);
  const restIncomingCount = new Map(incomingCount);
  const depthMap = new Map(flowchartNodes.map((node) => [node.id, 0]));
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
  flowchartNodes
    .filter((node) => !visited.has(node.id))
    .forEach((node, index) => depthMap.set(node.id, Math.max(depthMap.get(node.id) ?? 0, maxDepth + index + 1)));
  const layerMap = new Map<number, IFlowchartNode[]>();
  flowchartNodes.forEach((node) => {
    const depth = depthMap.get(node.id) ?? 0;
    layerMap.set(depth, [...(layerMap.get(depth) ?? []), node]);
  });
  const layers = [...layerMap.entries()].sort(([a], [b]) => a - b).map(([, layer]) => layer);
  const nodeWidthMap = new Map(
    flowchartNodes.map((node) => [node.id, getNodeWidth(node, flowchart.id, lockedNodeVisibility)]),
  );
  const layerWidths = layers.map(
    (layer) =>
      layer.reduce((sum, node) => sum + (nodeWidthMap.get(node.id) ?? NODE_MIN_WIDTH), 0) +
      (layer.length - 1) * NODE_GAP,
  );
  const width = MARGIN_X * 2 + Math.max(NODE_MIN_WIDTH, ...layerWidths);
  const layoutNodeMap = new Map<string, LayoutNode>();
  layers.forEach((layer, depth) => {
    const layerWidth = layerWidths[depth];
    let x = (width - layerWidth) / 2;
    layer.forEach((node) => {
      const nodeWidth = nodeWidthMap.get(node.id) ?? NODE_MIN_WIDTH;
      const parentXs = (parentMap.get(node.id) ?? [])
        .map((id) => {
          const parent = layoutNodeMap.get(id);
          return parent ? parent.x + parent.width / 2 : undefined;
        })
        .filter((parentX): parentX is number => typeof parentX === 'number');
      layoutNodeMap.set(node.id, {
        ...node,
        width: nodeWidth,
        x:
          layer.length === 1 && parentXs.length > 0
            ? parentXs.reduce((sum, parentX) => sum + parentX, 0) / parentXs.length - nodeWidth / 2
            : x,
        y: MARGIN_Y + depth * ROW_GAP,
      });
      x += nodeWidth + NODE_GAP;
    });
  });
  const nodes = [...layoutNodeMap.values()];
  const edges = validEdges
    .map((edge) => ({
      ...edge,
      sourceNode: layoutNodeMap.get(edge.source),
      targetNode: layoutNodeMap.get(edge.target),
    }))
    .filter((edge): edge is LayoutEdge => Boolean(edge.sourceNode && edge.targetNode));
  return { nodes, edges, width, height: MARGIN_Y * 2 + NODE_HEIGHT + (layers.length - 1) * ROW_GAP };
}

function getNodeWidth(node: IFlowchartNode, flowchartId: string, lockedNodeVisibility: LockedNodeVisibility) {
  if (lockedNodeVisibility === 'node' && !WebGAL.flowchartManager.isUnlocked(flowchartId, node.id))
    return NODE_MIN_WIDTH;
  const label = node.data?.label || node.id;
  const textWidth = Array.from(label).reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 24 : 14), 0);
  return Math.max(NODE_MIN_WIDTH, textWidth + 36);
}

function normalizeLockedNodeVisibility(value: unknown): LockedNodeVisibility {
  return value === 'all' || value === 'none' ? value : 'node';
}

function getConnectorSegments(edges: LayoutEdge[], flowchartId: string): ConnectorSegment[] {
  const targetBendYMap = getTargetBendYMap(edges);
  const edgeGroups = new Map<string, LayoutEdge[]>();
  edges.forEach((edge) => edgeGroups.set(edge.source, [...(edgeGroups.get(edge.source) ?? []), edge]));
  return [...edgeGroups.values()].flatMap((groupEdges) =>
    getConnectorSegmentsBySource(groupEdges, flowchartId, targetBendYMap),
  );
}

function getTargetBendYMap(edges: LayoutEdge[]) {
  const targetGroups = new Map<string, LayoutEdge[]>();
  edges.forEach((edge) => targetGroups.set(edge.target, [...(targetGroups.get(edge.target) ?? []), edge]));
  const bendYMap = new Map<string, number>();
  targetGroups.forEach((targetEdges, target) => {
    if (targetEdges.length < 2) return;
    const ty = targetEdges[0].targetNode.y - CONNECTOR_GAP;
    const maxSourceY = Math.max(...targetEdges.map((edge) => edge.sourceNode.y + NODE_HEIGHT));
    bendYMap.set(target, getSingleEdgeBendY(maxSourceY, ty));
  });
  return bendYMap;
}

function getConnectorSegmentsBySource(
  edges: LayoutEdge[],
  flowchartId: string,
  targetBendYMap: Map<string, number>,
): ConnectorSegment[] {
  if (edges.length === 0) return [];
  const source = edges[0].sourceNode;
  const sx = source.x + source.width / 2;
  const sy = source.y + NODE_HEIGHT;
  const sourceUnlocked = WebGAL.flowchartManager.isUnlocked(flowchartId, source.id);
  if (edges.length === 1) {
    const edge = edges[0];
    const tx = edge.targetNode.x + edge.targetNode.width / 2;
    const ty = edge.targetNode.y - CONNECTOR_GAP;
    const bendY = targetBendYMap.get(edge.target) ?? getSingleEdgeBendY(sy, ty);
    return [
      {
        id: edge.id,
        d: sx === tx ? `M ${sx} ${sy} V ${ty}` : `M ${sx} ${sy} V ${bendY} H ${tx} V ${ty}`,
        unlocked: sourceUnlocked && WebGAL.flowchartManager.isUnlocked(flowchartId, edge.target),
        arrow: true,
        layerY: ty,
      },
    ];
  }
  const targetXs = edges.map((edge) => edge.targetNode.x + edge.targetNode.width / 2);
  const targetY = Math.min(...edges.map((edge) => edge.targetNode.y)) - CONNECTOR_GAP;
  const busY = sy + Math.max(34, (targetY - sy) / 2);
  const hasUnlockedTarget = edges.some((edge) => WebGAL.flowchartManager.isUnlocked(flowchartId, edge.target));
  const segments: ConnectorSegment[] = [
    {
      id: `${source.id}-trunk`,
      d: `M ${sx} ${sy} V ${busY}`,
      unlocked: sourceUnlocked && hasUnlockedTarget,
      arrow: false,
      layerY: busY,
    },
    {
      id: `${source.id}-bus`,
      d: `M ${Math.min(...targetXs)} ${busY} H ${Math.max(...targetXs)}`,
      unlocked: sourceUnlocked && hasUnlockedTarget,
      arrow: false,
      layerY: busY,
    },
  ];
  edges.forEach((edge) => {
    const tx = edge.targetNode.x + edge.targetNode.width / 2;
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

function getSingleEdgeBendY(sy: number, ty: number) {
  const spanY = ty - sy;
  return spanY > ROW_GAP ? ty - Math.max(34, Math.min(70, spanY / 4)) : sy + Math.max(30, spanY / 2);
}
