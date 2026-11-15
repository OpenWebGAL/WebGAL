import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import type { BuiltInScreenVariant, FlowchartScreenProps, ScreenPartDefinition } from '@/screens/contracts';
import { useScreenParts } from '@/sdk/globalUiSdk';

type FlowchartItem = FlowchartScreenProps['flowcharts'][number];
type FlowchartNode = FlowchartItem['nodes'][number];
type FlowchartEdge = FlowchartItem['edges'][number];

interface LayoutNode extends FlowchartNode {
  x: number;
  y: number;
  width: number;
}

interface LayoutEdge extends FlowchartEdge {
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

const NODE_MIN_WIDTH = 190;
const NODE_HEIGHT = 78;
const NODE_GAP = 80;
const ROW_GAP = 170;
const MARGIN_X = 90;
const MARGIN_Y = 45;
const CONNECTOR_GAP = 12;

const FLOWCHART_PARTS: ScreenPartDefinition[] = [
  { id: 'main', name: '流程图页面容器', selector: '.Flowchart_main', allowLayoutEdit: true },
  { id: 'top', name: '顶部栏', selector: '.flowchart_top', allowLayoutEdit: true },
  { id: 'title', name: '水印标题', selector: '.flowchart_title', allowLayoutEdit: true },
  { id: 'sidebar', name: '分支列表栏', selector: '.flowchart_sidebar', allowLayoutEdit: true },
  { id: 'tabButton', name: '分支标签', selector: '.flowchart_tab', allowLayoutEdit: false },
  { id: 'canvasArea', name: '画布视口', selector: '.flowchart_content', allowLayoutEdit: true },
];

const FLOWCHART_DEFAULT_CSS = `
@keyframes Flowchart_Elements_in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

.Flowchart_backdrop {
  position: absolute;
  left: 0px;
  top: 0px;
  width: 2560px;
  height: 1440px;
  z-index: 15;
  padding-bottom: 144px; /* 底部 144px 预留给 MenuPanel 浮层 */
  box-sizing: border-box;
  background-image: linear-gradient(to top, #accbee 0%, #e7f0fd 100%);
  backdrop-filter: blur(50px);
}

.Flowchart_main {
  font-family: "思源宋体", serif;
  position: relative;
  height: 100%;
  width: 100%;
  cursor: default;
  display: flex;
  flex-direction: column;
}

.flowchart_top {
  height: 129.6px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: Flowchart_Elements_in 0.7s ease-out forwards;
  flex-shrink: 0;
}

.flowchart_title {
  font-family: "思源宋体", serif;
  letter-spacing: 0.1em;
  width: auto;
  font-size: 128px;
  min-width: 350px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  left: 20px;
  top: 0px;
  z-index: 0;
  opacity: 0.22;
  transform: translateY(-10px);
  pointer-events: none;
}

.flowchart_title_text {
  font-weight: bold;
  color: transparent;
  background: linear-gradient(135deg, #2B5F75 0%, #7ba8bc 100%);
  text-shadow: 2px 2px 15px rgba(255, 255, 255, 0.5);
  -webkit-background-clip: text;
  background-clip: text;
}

.flowchart_body {
  display: flex;
  gap: 64px;
  height: 1166.4px;
  min-height: 0px;
  padding: 12.8px 128px 25.6px 128px;
  box-sizing: border-box;
  animation: Flowchart_Elements_in 0.7s ease-out forwards;
}

.flowchart_sidebar {
  width: 460.8px;
  padding: 12.8px 0px;
  flex-shrink: 0;
  overflow: auto;
}

.flowchart_tab {
  font-family: "资源圆体", serif;
  display: block;
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.55);
  margin: 0px 0px 25.92px 0px;
  padding: 22.46px 27.65px;
  border-radius: 4px;
  text-align: left;
  font-size: 34.56px;
  color: rgba(52, 80, 92, 0.78);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.78), rgba(239, 247, 250, 0.72));
  cursor: pointer;
  transition: color 0.25s, background 0.25s, border-color 0.25s;
}

.flowchart_tab:hover,
.flowchart_tab.flowchart_tab_active {
  color: #2B5F75;
  border-color: rgba(43, 95, 117, 0.36);
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(226, 240, 246, 0.85));
}

.flowchart_content {
  flex: 1;
  min-width: 0px;
  display: flex;
  overflow-x: hidden;
  overflow-y: auto;
  user-select: none;
  cursor: grab;
  padding: 25.6px;
  box-sizing: border-box;
  border-radius: 4px;
  background: linear-gradient(-45deg, rgba(255, 255, 255, 0.32), rgba(226, 240, 246, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: inset 0px 0px 24px rgba(255, 255, 255, 0.38), 0px 10px 28px rgba(43, 95, 117, 0.06);
}

.flowchart_content.flowchart_content_dragging {
  cursor: grabbing;
}

.flowchart_content.flowchart_content_dragging .flowchart_node_unlocked {
  cursor: grabbing;
}

.flowchart_empty {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 46.08px;
  color: rgba(52, 80, 92, 0.72);
}

.flowchart_canvas {
  display: block;
  flex: 0 0 auto;
  margin: 0px auto;
  overflow: visible;
}

.flowchart_line_unlocked {
  fill: none;
  stroke: #2B5F75;
  stroke-width: 3px;
  filter: drop-shadow(0px 0px 6px rgba(43, 95, 117, 0.28));
  pointer-events: none;
}

.flowchart_line_locked {
  fill: none;
  stroke: #a9b7c4;
  stroke-width: 3px;
  stroke-dasharray: 7px 8px;
  pointer-events: none;
}

.flowchart_arrow_unlocked {
  fill: #2B5F75;
}

.flowchart_arrow_locked {
  fill: #a9b7c4;
}

.flowchart_node {
  font-family: "资源圆体", serif;
  outline: none;
}

.flowchart_node.flowchart_node_unlocked {
  cursor: pointer;
}

.flowchart_node.flowchart_node_locked {
  cursor: default;
  opacity: 0.62;
}

.flowchart_node_rect {
  transition: stroke 0.2s, filter 0.2s;
}

.flowchart_node_rect.flowchart_node_rect_unlocked {
  fill: url(#flowchart-node-unlocked);
  stroke: #2B5F75;
  stroke-width: 2px;
  filter: url(#flowchart-node-glow);
}

.flowchart_node_unlocked:hover .flowchart_node_rect_unlocked,
.flowchart_node_unlocked:focus-visible .flowchart_node_rect_unlocked {
  stroke: #1f4e63;
  filter: drop-shadow(0px 0px 10px rgba(43, 95, 117, 0.42));
}

.flowchart_node_rect.flowchart_node_rect_locked {
  fill: url(#flowchart-node-locked);
  stroke: rgba(154, 174, 194, 0.8);
  stroke-width: 1.5px;
}

.flowchart_node_label {
  fill: #243f4b;
  font-size: 22px;
  font-weight: bold;
  stroke: rgba(255, 255, 255, 0.85);
  stroke-width: 3px;
  paint-order: stroke fill;
  pointer-events: none;
}

.flowchart_node_locked .flowchart_node_label {
  fill: rgba(97, 115, 133, 0.72);
}
`.trim();

function getNodeWidth(
  node: FlowchartNode,
  flowchartId: string,
  unlockedSet: Set<string>,
  lockedNodeVisibility: 'all' | 'node' | 'none',
): number {
  if (lockedNodeVisibility === 'node' && !unlockedSet.has(`${flowchartId}-${node.id}`)) {
    return NODE_MIN_WIDTH;
  }
  const label = node.data?.label || node.id;
  const textWidth = Array.from(label).reduce((sum, char) => sum + (char.charCodeAt(0) > 255 ? 24 : 14), 0);
  return Math.max(NODE_MIN_WIDTH, textWidth + 36);
}

function getSingleEdgeBendY(sy: number, ty: number): number {
  const spanY = ty - sy;
  return spanY > ROW_GAP ? ty - Math.max(34, Math.min(70, spanY / 4)) : sy + Math.max(30, spanY / 2);
}

function getTargetBendYMap(edges: LayoutEdge[]): Map<string, number> {
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
  unlockedSet: Set<string>,
  targetBendYMap: Map<string, number>,
): ConnectorSegment[] {
  if (edges.length === 0) return [];
  const source = edges[0].sourceNode;
  const sx = source.x + source.width / 2;
  const sy = source.y + NODE_HEIGHT;
  const sourceUnlocked = unlockedSet.has(`${flowchartId}-${source.id}`);

  if (edges.length === 1) {
    const edge = edges[0];
    const tx = edge.targetNode.x + edge.targetNode.width / 2;
    const ty = edge.targetNode.y - CONNECTOR_GAP;
    const bendY = targetBendYMap.get(edge.target) ?? getSingleEdgeBendY(sy, ty);
    return [
      {
        id: edge.id,
        d: sx === tx ? `M ${sx} ${sy} V ${ty}` : `M ${sx} ${sy} V ${bendY} H ${tx} V ${ty}`,
        unlocked: sourceUnlocked && unlockedSet.has(`${flowchartId}-${edge.target}`),
        arrow: true,
        layerY: ty,
      },
    ];
  }

  const targetXs = edges.map((edge) => edge.targetNode.x + edge.targetNode.width / 2);
  const targetY = Math.min(...edges.map((edge) => edge.targetNode.y)) - CONNECTOR_GAP;
  const busY = sy + Math.max(34, (targetY - sy) / 2);
  const hasUnlockedTarget = edges.some((edge) => unlockedSet.has(`${flowchartId}-${edge.target}`));

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
      unlocked: sourceUnlocked && unlockedSet.has(`${flowchartId}-${edge.target}`),
      arrow: true,
      layerY: edge.targetNode.y - CONNECTOR_GAP,
    });
  });
  return segments;
}

function getConnectorSegments(edges: LayoutEdge[], flowchartId: string, unlockedSet: Set<string>): ConnectorSegment[] {
  const targetBendYMap = getTargetBendYMap(edges);
  const edgeGroups = new Map<string, LayoutEdge[]>();
  edges.forEach((edge) => edgeGroups.set(edge.source, [...(edgeGroups.get(edge.source) ?? []), edge]));
  return [...edgeGroups.values()].flatMap((groupEdges) =>
    getConnectorSegmentsBySource(groupEdges, flowchartId, unlockedSet, targetBendYMap),
  );
}

function layoutFlowchart(
  flowchart: FlowchartItem | undefined,
  unlockedSet: Set<string>,
  lockedNodeVisibility: 'all' | 'node' | 'none',
) {
  if (!flowchart) return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 0, height: 0 };
  const flowchartNodes =
    lockedNodeVisibility === 'none'
      ? flowchart.nodes.filter((node) => unlockedSet.has(`${flowchart.id}-${node.id}`))
      : flowchart.nodes;
  if (flowchartNodes.length === 0) {
    return { nodes: [] as LayoutNode[], edges: [] as LayoutEdge[], width: 0, height: 0 };
  }

  const nodeMap = new Map(flowchartNodes.map((node) => [node.id, node]));
  const validEdges = flowchart.edges.filter((edge) => nodeMap.has(edge.source) && nodeMap.has(edge.target));
  const incomingCount = new Map(flowchartNodes.map((node) => [node.id, 0]));
  const adjacency = new Map<string, FlowchartEdge[]>();
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

  const layerMap = new Map<number, FlowchartNode[]>();
  flowchartNodes.forEach((node) => {
    const depth = depthMap.get(node.id) ?? 0;
    layerMap.set(depth, [...(layerMap.get(depth) ?? []), node]);
  });

  const layers = [...layerMap.entries()].sort(([a], [b]) => a - b).map(([, layer]) => layer);
  const nodeWidthMap = new Map(
    flowchartNodes.map((node) => [node.id, getNodeWidth(node, flowchart.id, unlockedSet, lockedNodeVisibility)]),
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

export function FlowchartDefaultScreen(props: FlowchartScreenProps) {
  const { visible, flowcharts, unlockedNodeKeys, lockedNodeVisibility, t, playSe, onJumpToNode } = props;
  const { rootProps } = useScreenParts('flowchart', FLOWCHART_PARTS, FLOWCHART_DEFAULT_CSS);
  const [currentFlowchartId, setCurrentFlowchartId] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({ moved: false, scrollLeft: 0, scrollTop: 0, startX: 0, startY: 0 });
  const blockClickRef = useRef(false);

  useEffect(() => {
    if (!currentFlowchartId && flowcharts[0]) {
      setCurrentFlowchartId(flowcharts[0].id);
    }
  }, [currentFlowchartId, flowcharts]);

  const unlockedSet = useMemo(() => new Set(unlockedNodeKeys), [unlockedNodeKeys]);
  const currentFlowchart = flowcharts.find((item) => item.id === currentFlowchartId) ?? flowcharts[0];
  const layout = useMemo(
    () => layoutFlowchart(currentFlowchart, unlockedSet, lockedNodeVisibility),
    [currentFlowchart, unlockedSet, lockedNodeVisibility],
  );
  const segments = useMemo(() => {
    if (!currentFlowchart) return [];
    return getConnectorSegments(layout.edges, currentFlowchart.id, unlockedSet).sort((a, b) => b.layerY - a.layerY);
  }, [layout.edges, currentFlowchart, unlockedSet]);

  if (!visible) return null;

  const handleJump = (node: LayoutNode) => {
    if (blockClickRef.current) {
      blockClickRef.current = false;
      return;
    }
    if (!currentFlowchart || !unlockedSet.has(`${currentFlowchart.id}-${node.id}`)) return;
    onJumpToNode(currentFlowchart.id, node.id);
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
    <div {...rootProps} className={`${rootProps.className} Flowchart_backdrop`}>
      <div className="Flowchart_main">
        <div className="flowchart_top">
          <div className="flowchart_title">
            <div className="flowchart_title_text">{t('gaming.flowchart.title')}</div>
          </div>
        </div>

        <div className="flowchart_body">
          <div className="flowchart_sidebar">
            {flowcharts.map((flowchart) => {
              const isActive = currentFlowchart?.id === flowchart.id;
              return (
                <button
                  key={flowchart.id}
                  type="button"
                  className={`flowchart_tab${isActive ? ' flowchart_tab_active' : ''}`}
                  onMouseEnter={playSe.enter}
                  onClick={() => {
                    playSe.click();
                    setCurrentFlowchartId(flowchart.id);
                  }}
                >
                  {flowchart.name}
                </button>
              );
            })}
          </div>

          <div
            className={`flowchart_content${isDragging ? ' flowchart_content_dragging' : ''}`}
            onMouseDown={dragFlowchart}
          >
            {!currentFlowchart ? (
              <div className="flowchart_empty">{t('gaming.flowchart.empty')}</div>
            ) : (
              <svg
                className="flowchart_canvas"
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
                    <path className="flowchart_arrow_unlocked" d="M 0 0 L 10 5 L 0 10 z" />
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
                    <path className="flowchart_arrow_locked" d="M 0 0 L 10 5 L 0 10 z" />
                  </marker>
                </defs>

                {segments.map((segment) => (
                  <path
                    key={segment.id}
                    className={segment.unlocked ? 'flowchart_line_unlocked' : 'flowchart_line_locked'}
                    d={segment.d}
                    markerEnd={
                      segment.arrow
                        ? `url(#${segment.unlocked ? 'flowchart-arrow-unlocked' : 'flowchart-arrow-locked'})`
                        : undefined
                    }
                  />
                ))}

                {layout.nodes.map((node) => {
                  const unlocked = unlockedSet.has(`${currentFlowchart.id}-${node.id}`);
                  const labelText = unlocked || lockedNodeVisibility === 'all' ? node.data?.label || node.id : '';
                  return (
                    <g
                      key={node.id}
                      className={`flowchart_node${unlocked ? ' flowchart_node_unlocked' : ' flowchart_node_locked'}`}
                      role={unlocked ? 'button' : undefined}
                      tabIndex={unlocked ? 0 : -1}
                      onClick={() => unlocked && handleJump(node)}
                      onKeyDown={(event) => {
                        if (unlocked && (event.key === 'Enter' || event.key === ' ')) handleJump(node);
                      }}
                      onMouseEnter={unlocked ? playSe.enter : undefined}
                    >
                      <title>{labelText || t('gaming.flowchart.locked')}</title>
                      <rect
                        className={`flowchart_node_rect${
                          unlocked ? ' flowchart_node_rect_unlocked' : ' flowchart_node_rect_locked'
                        }`}
                        x={node.x}
                        y={node.y}
                        width={node.width}
                        height={NODE_HEIGHT}
                        rx="8"
                      />
                      <text
                        className="flowchart_node_label"
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
    </div>
  );
}

export const FLOWCHART_DEFAULT_VARIANT: BuiltInScreenVariant<FlowchartScreenProps> = {
  screen: 'flowchart',
  variantId: 'default',
  name: '分支流程图',
  component: FlowchartDefaultScreen,
  parts: FLOWCHART_PARTS,
  defaultCssText: FLOWCHART_DEFAULT_CSS,
};
