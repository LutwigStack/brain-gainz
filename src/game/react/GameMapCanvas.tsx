import { Application } from 'pixi.js';
import { useEffect, useEffectEvent, useMemo, useRef } from 'react';

import type { NavigationNodeSummary, NavigationSnapshot, NodeFocusSnapshot } from '../../types/app-shell';
import { BrainGainzScene } from '../brain-gainz-scene';
import { createGameViewModel } from '../create-game-view-model';

interface GameMapCanvasProps {
  snapshot: NavigationSnapshot | null;
  focus: NodeFocusSnapshot | null;
  onSelectNode: (node: NavigationNodeSummary) => void;
}

const findNodeById = (snapshot: NavigationSnapshot | null, nodeId: number): NavigationNodeSummary | null => {
  if (!snapshot) {
    return null;
  }

  for (const sphere of snapshot.spheres) {
    for (const direction of sphere.directions) {
      for (const skill of direction.skills) {
        const matched = skill.nodes.find((node) => node.id === nodeId);
        if (matched) {
          return matched;
        }
      }
    }
  }

  return null;
};

export const GameMapCanvas = ({ snapshot, focus, onSelectNode }: GameMapCanvasProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const appRef = useRef<Application | null>(null);
  const sceneRef = useRef<BrainGainzScene | null>(null);
  const modelRef = useRef(createGameViewModel(snapshot, focus));
  const onSelectNodeEvent = useEffectEvent((nodeId: number) => {
    const node = findNodeById(snapshot, nodeId);
    if (node) {
      onSelectNode(node);
    }
  });

  const model = useMemo(() => createGameViewModel(snapshot, focus), [focus, snapshot]);

  useEffect(() => {
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const mount = async () => {
      if (!hostRef.current) {
        return;
      }

      const app = new Application();
      await app.init({
        antialias: true,
        autoDensity: true,
        backgroundAlpha: 0,
        resizeTo: hostRef.current,
      });

      if (cancelled) {
        app.destroy(true);
        return;
      }

      hostRef.current.appendChild(app.canvas);
      appRef.current = app;
      sceneRef.current = new BrainGainzScene(app);
      sceneRef.current.render(modelRef.current, onSelectNodeEvent);

      resizeObserver = new ResizeObserver(() => {
        sceneRef.current?.render(modelRef.current, onSelectNodeEvent);
      });
      resizeObserver.observe(hostRef.current);
    };

    void mount();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      sceneRef.current?.destroy();
      sceneRef.current = null;
      appRef.current?.destroy(true, { children: true });
      appRef.current = null;
    };
  }, []);

  useEffect(() => {
    modelRef.current = model;
    sceneRef.current?.render(model, onSelectNodeEvent);
  }, [model]);

  return (
    <div
      ref={hostRef}
      className="h-[560px] w-full overflow-hidden rounded-[1rem] border border-[var(--pixel-line-soft)] bg-[var(--pixel-panel-inset)]"
    />
  );
};
