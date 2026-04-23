import React, { Suspense, lazy, useEffect, useState } from 'react';
import {
  Brain,
  Compass,
  Download,
  Map,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';

import * as db from './db';
import {
  PixelButton,
  PixelMeter,
  PixelStack,
  PixelSurface,
  PixelText,
} from './components/pixel';
import {
  canDuplicateNodeEditorDraft,
  buildNodeEditorDuplicatePayload,
  buildNodeEditorUpdatePayload,
} from './components/navigation-editor-draft.ts';
import { createNavigationFollowUpPayload } from './application/navigation-follow-up.ts';
import { getRuntimeProfile } from './platform/runtime.js';

const NowView = lazy(() =>
  import('./components/NowView').then((module) => ({ default: module.NowView })),
);
const NavigationView = lazy(() =>
  import('./components/NavigationView').then((module) => ({ default: module.NavigationView })),
);

export default function App() {
  const runtime = getRuntimeProfile();
  const [activeTab, setActiveTab] = useState('now');
  const normalizedActiveTab = activeTab === 'now' || activeTab === 'map' ? activeTab : 'map';
  const [activeSubject, setActiveSubject] = useState(null);
  const [words, setWords] = useState([]);
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('braingainz_groq_key') || '');
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('braingainz_target_lang') || 'Russian');
  const [sourceLanguage, setSourceLanguage] = useState(localStorage.getItem('braingainz_source_lang') || 'English');
  const [showSettings, setShowSettings] = useState(false);
  const [nowSnapshot, setNowSnapshot] = useState(null);
  const [nowLoading, setNowLoading] = useState(false);
  const [nowError, setNowError] = useState(null);
  const [nowCreatingStarter, setNowCreatingStarter] = useState(false);
  const [nowFocus, setNowFocus] = useState(null);
  const [nowFocusLoading, setNowFocusLoading] = useState(false);
  const [nowSelection, setNowSelection] = useState(null);
  const [navigationSnapshot, setNavigationSnapshot] = useState(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [navigationError, setNavigationError] = useState(null);
  const [navigationFocus, setNavigationFocus] = useState(null);
  const [navigationFocusLoading, setNavigationFocusLoading] = useState(false);
  const [navigationSelection, setNavigationSelection] = useState(null);
  const [mapStartingSession, setMapStartingSession] = useState(false);
  const [mapCompletingAction, setMapCompletingAction] = useState(false);
  const [mapActiveOutcomeAction, setMapActiveOutcomeAction] = useState(null);
  const [mapOutcomeNote, setMapOutcomeNote] = useState('');
  const [mapBarrierType, setMapBarrierType] = useState('too complex');
  const [mapShrinkTitle, setMapShrinkTitle] = useState('');
  const [nodeEditorPendingAction, setNodeEditorPendingAction] = useState(null);
  const [nodeEditorNotice, setNodeEditorNotice] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        await db.initDb();
        const subjects = await db.getSubjects();

        if (subjects.length > 0) {
          const lastSubjectId = Number(localStorage.getItem('braingainz_last_subject_id'));
          const preferredSubject = subjects.find((subject) => subject.id === lastSubjectId) ?? subjects[0];
          setActiveSubject(preferredSubject);
        }
      } catch (error) {
        console.error('DB Initialization error', error);
      }
    };

    void init();
  }, []);

  useEffect(() => {
    if (!activeSubject) {
      setWords([]);
      return;
    }

    localStorage.setItem('braingainz_last_subject_id', String(activeSubject.id));
    void db.getCards(activeSubject.id).then(setWords);
  }, [activeSubject]);

  useEffect(() => {
    localStorage.setItem('braingainz_groq_key', groqApiKey);
  }, [groqApiKey]);

  useEffect(() => {
    localStorage.setItem('braingainz_target_lang', targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    localStorage.setItem('braingainz_source_lang', sourceLanguage);
  }, [sourceLanguage]);

  const chooseNowSelection = (snapshot, preferredSelection = null) => {
    const candidates = [snapshot?.primaryRecommendation, ...(snapshot?.queue ?? [])].filter(Boolean);

    if (candidates.length === 0) {
      return null;
    }

    if (preferredSelection) {
      const matched = candidates.find((candidate) => candidate.actionId === preferredSelection.actionId);

      if (matched) {
        return { nodeId: matched.nodeId, actionId: matched.actionId };
      }
    }

    return {
      nodeId: candidates[0].nodeId,
      actionId: candidates[0].actionId,
    };
  };

  const loadNowFocus = async (selection) => {
    if (!selection) {
      setNowFocus(null);
      return;
    }

    setNowFocusLoading(true);

    try {
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId);
      setNowFocus(focus);
    } catch (error) {
      console.error('Failed to load Now focus', error);
      setNowError(error.message || 'Не удалось загрузить детали узла.');
    } finally {
      setNowFocusLoading(false);
    }
  };

  const loadNavigationFocus = async (selection) => {
    if (!selection?.nodeId) {
      setNavigationFocus(null);
      return;
    }

    setNavigationFocusLoading(true);

    try {
      const focus = await db.getNowNodeFocus(selection.nodeId, selection.actionId ?? null);
      setNavigationFocus(focus);
    } catch (error) {
      console.error('Failed to load navigation focus', error);
      setNavigationError(error.message || 'Не удалось загрузить выбранный узел.');
    } finally {
      setNavigationFocusLoading(false);
    }
  };

  const loadNowDashboard = async (preferredSelection = nowSelection) => {
    setNowLoading(true);
    setNowError(null);

    try {
      const snapshot = await db.getNowDashboard();
      setNowSnapshot(snapshot);
      const nextSelection = chooseNowSelection(snapshot, preferredSelection);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
    } catch (error) {
      console.error('Failed to load Now dashboard', error);
      setNowError(error.message || 'Не удалось загрузить экран «Сейчас».');
      setNowFocus(null);
    } finally {
      setNowLoading(false);
    }
  };

  const loadNavigationSnapshot = async (preferredSelection = navigationSelection) => {
    setNavigationLoading(true);
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const snapshot = await db.getNavigationSnapshot();
      setNavigationSnapshot(snapshot);
      const nextSelection = preferredSelection ?? snapshot.defaultSelection ?? null;
      setNavigationSelection(nextSelection);
      await loadNavigationFocus(nextSelection);
    } catch (error) {
      console.error('Failed to load navigation snapshot', error);
      setNavigationError(error.message || 'Не удалось загрузить карту.');
      setNavigationFocus(null);
    } finally {
      setNavigationLoading(false);
    }
  };

  useEffect(() => {
    if (normalizedActiveTab === 'now') {
      void loadNowDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab]);

  useEffect(() => {
    if (normalizedActiveTab === 'map') {
      void loadNavigationSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedActiveTab]);

  const handleCreateStarterWorkspace = async () => {
    setNowCreatingStarter(true);
    setNowError(null);

    try {
      const snapshot = await db.createStarterWorkspace();
      setNowSnapshot(snapshot);
      const nextSelection = chooseNowSelection(snapshot);
      setNowSelection(nextSelection);
      await loadNowFocus(nextSelection);
    } catch (error) {
      console.error('Failed to create starter workspace', error);
      setNowError(error.message || 'Не удалось создать стартовый набор.');
    } finally {
      setNowCreatingStarter(false);
    }
  };

  const applyOutcomeResult = async (result) => {
    if (!result) {
      return;
    }

    setNowSnapshot(result.dashboard);
    setNowFocus(result.focus);

    const nextSelection = result.focus?.selectedAction
      ? { nodeId: result.focus.node.id, actionId: result.focus.selectedAction.id }
      : result.focus?.node
        ? { nodeId: result.focus.node.id, actionId: null }
        : null;

    setNowSelection(nextSelection);
    setNavigationSelection(nextSelection);
    await loadNavigationSnapshot(nextSelection);
    setMapOutcomeNote('');
    setMapShrinkTitle('');
  };

  const applyNodeEditorMutationResult = async (result, notice = null) => {
    if (!result) {
      return;
    }

    setNowSnapshot(result.dashboard);
    const nextNowSelection = chooseNowSelection(result.dashboard, result.selection);
    setNowSelection(nextNowSelection);
    await loadNowFocus(nextNowSelection);

    setNavigationSnapshot(result.navigation);
    setNavigationSelection(result.selection);
    setNavigationFocus(result.focus);
    setMapOutcomeNote('');
    setMapShrinkTitle('');
    setNodeEditorNotice(typeof notice === 'function' ? notice(result) : notice);
  };

  const handleSelectNowRecommendation = async (recommendation) => {
    const selection = {
      nodeId: recommendation.nodeId,
      actionId: recommendation.actionId,
    };

    setNowSelection(selection);
    setNavigationSelection(selection);
    setNowError(null);
    await loadNowFocus(selection);
  };

  const handleSelectNavigationNode = async (node) => {
    const selection = {
      nodeId: node.id,
      actionId: node.next_action_id ?? null,
    };

    setNavigationSelection(selection);
    setNavigationError(null);
    setNodeEditorNotice(null);
    await loadNavigationFocus(selection);
  };

  const handleSelectNavigationAction = async (action) => {
    if (!navigationFocus?.node) {
      return;
    }

    const selection = {
      nodeId: navigationFocus.node.id,
      actionId: action.id,
    };

    setNavigationSelection(selection);
    setNavigationError(null);
    setNodeEditorNotice(null);
    await loadNavigationFocus(selection);
  };

  const persistNodeEditorDraft = async (draft) => {
    if (!navigationFocus?.node) {
      return null;
    }

    return db.updateNodeRecord(navigationFocus.node.id, buildNodeEditorUpdatePayload(navigationFocus, draft));
  };

  const handleSaveNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    setNodeEditorPendingAction('save');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await persistNodeEditorDraft(draft);
      await applyNodeEditorMutationResult(result, 'Изменения узла сохранены в базе.');
    } catch (error) {
      console.error('Failed to save node editor state', error);
      setNavigationError(error.message || 'Не удалось сохранить узел.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleDuplicateNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    if (!canDuplicateNodeEditorDraft(navigationFocus, draft)) {
      setNavigationError('Ð¡Ð½Ð°Ñ‡Ð°Ð»Ð° ÑÐ¾Ñ…Ñ€Ð°Ð½Ð¸Ñ‚Ðµ type/status ÑƒÐ·Ð»Ð°, Ð·Ð°Ñ‚ÐµÐ¼ Ð´ÑƒÐ±Ð»Ð¸Ñ€ÑƒÐ¹Ñ‚Ðµ.');
      return;
    }

    setNodeEditorPendingAction('duplicate');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.duplicateNodeRecord(
        navigationFocus.node.id,
        buildNodeEditorDuplicatePayload(draft),
      );
      await applyNodeEditorMutationResult(
        result,
        (mutationResult) =>
          mutationResult.focus
            ? `Создан дубль. Фокус переведен на «${mutationResult.focus.node.title}».`
            : 'Создан persisted duplicate узла.',
      );
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to duplicate node editor state', error);
      setNavigationError(error.message || 'Не удалось создать дубль узла.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleArchiveNodeEditor = async (draft) => {
    if (!navigationFocus?.node) {
      return;
    }

    setNodeEditorPendingAction('archive');
    setNavigationError(null);
    setNodeEditorNotice(null);

    try {
      const result = await db.archiveNodeRecord(
        navigationFocus.node.id,
        buildNodeEditorUpdatePayload(navigationFocus, draft),
      );
      await applyNodeEditorMutationResult(
        result,
        (mutationResult) =>
          mutationResult.focus
            ? `Узел отправлен в архив. Фокус перенесен на «${mutationResult.focus.node.title}».`
            : 'Узел отправлен в архив.',
      );
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to archive node editor state', error);
      setNavigationError(error.message || 'Не удалось архивировать узел.');
    } finally {
      setNodeEditorPendingAction(null);
    }
  };

  const handleStartNavigationSession = async () => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapStartingSession(true);
    setNavigationError(null);

    try {
      await db.startTodaySessionFromRecommendation(navigationSelection.actionId);
      await loadNowDashboard(navigationSelection);
      await loadNavigationSnapshot(navigationSelection);
    } catch (error) {
      console.error('Failed to start navigation session', error);
      setNavigationError(error.message || 'Не удалось запустить сессию для узла.');
    } finally {
      setMapStartingSession(false);
    }
  };

  const runNavigationOutcome = async (type, operation) => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapActiveOutcomeAction(type);
    setNavigationError(null);

    try {
      const result = await operation();
      await applyOutcomeResult(result);
    } catch (error) {
      console.error(`Failed to ${type} navigation action`, error);
      setNavigationError(error.message || 'Не удалось изменить шаг узла.');
    } finally {
      setMapActiveOutcomeAction(null);
    }
  };

  const handleCompleteNavigationAction = async () => {
    if (!navigationSelection?.actionId) {
      return;
    }

    setMapCompletingAction(true);
    setNavigationError(null);

    try {
      const result = await db.completeNowActionInTodaySession(navigationSelection.actionId);
      await applyOutcomeResult(result);
    } catch (error) {
      console.error('Failed to complete navigation action', error);
      setNavigationError(error.message || 'Не удалось завершить шаг узла.');
    } finally {
      setMapCompletingAction(false);
    }
  };

  const handleDeferNavigationAction = async () => {
    await runNavigationOutcome('defer', () =>
      db.deferNowActionInTodaySession(navigationSelection.actionId, mapOutcomeNote),
    );
  };

  const handleBlockNavigationAction = async () => {
    await runNavigationOutcome('block', () =>
      db.blockNowActionInTodaySession(navigationSelection.actionId, {
        barrierType: mapBarrierType,
        note: mapOutcomeNote,
      }),
    );
  };

  const handleShrinkNavigationAction = async () => {
    await runNavigationOutcome('shrink', () =>
      db.shrinkNowActionInTodaySession(navigationSelection.actionId, {
        title: mapShrinkTitle,
        note: mapOutcomeNote,
      }),
    );
  };

  const handleCreateJournalFollowUp = async (payload) => {
    setNavigationError(null);

    try {
      const result = await db.createJournalFollowUpStep(
        createNavigationFollowUpPayload({
          nodeId: payload.nodeId,
          title: payload.title,
          nodeTitle: navigationFocus?.node?.title,
          note: payload.note,
          barrierType: payload.barrierType,
        }),
      );
      await applyOutcomeResult(result);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to create journal follow-up', error);
      setNavigationError(error.message || 'Не удалось создать следующий шаг.');
    }
  };

  const screenFallback = (
    <PixelSurface frame="panel" padding="xxl">
      <PixelText as="p" readable color="textMuted" size="sm">
        Загружаю экран…
      </PixelText>
    </PixelSurface>
  );

  return (
    <div
      className="pixel-shell-grid flex min-h-[100dvh] flex-col text-[var(--pixel-text)]"
      style={{
        paddingBottom: runtime.usesSafeAreaInsets ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      <header
        className="sticky top-0 z-50 px-3 pb-2 pt-2 sm:px-4"
        style={{
          paddingTop: runtime.usesSafeAreaInsets ? 'max(0.5rem, env(safe-area-inset-top))' : undefined,
        }}
      >
        <div className="flex w-full flex-col gap-2">
          <PixelSurface frame="panel" padding="sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <div className="flex items-center gap-2">
                  <PixelSurface frame="accent" padding="sm" fullWidth={false}>
                    <Brain size={24} className="text-[var(--pixel-accent-glow)]" />
                  </PixelSurface>
                  <div className="flex min-w-0 items-baseline gap-2">
                    <PixelText as="h1" size="lg" style={{ margin: 0, lineHeight: 1 }}>
                      BrainGainz
                    </PixelText>
                    <PixelText as="span" size="xs" color="textDim" uppercase>
                      {runtime.shellLabel} {runtime.storageLabel}
                    </PixelText>
                  </div>
                </div>

                <div
                  className="hide-scrollbar flex items-center gap-2 overflow-x-auto"
                  role="navigation"
                  aria-label="Основные разделы BrainGainz"
                >
                  <PixelButton
                    tone={normalizedActiveTab === 'now' ? 'accent' : 'panel'}
                    onClick={() => setActiveTab('now')}
                    aria-pressed={normalizedActiveTab === 'now'}
                    aria-current={normalizedActiveTab === 'now' ? 'page' : undefined}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                    <Compass size={14} /> Сейчас
                  </PixelButton>
                  <PixelButton
                    tone={normalizedActiveTab === 'map' ? 'accent' : 'panel'}
                    onClick={() => setActiveTab('map')}
                    aria-pressed={normalizedActiveTab === 'map'}
                    aria-current={normalizedActiveTab === 'map' ? 'page' : undefined}
                    style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                  >
                    <Map size={14} /> Карта
                  </PixelButton>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="min-w-[180px]">
                  <PixelMeter
                    value={runtime.isLocalFirst ? 72 : 48}
                    max={100}
                    label={runtime.isLocalFirst ? 'Локальная синхронизация' : 'Веб-оболочка'}
                    tone={runtime.isLocalFirst ? 'success' : 'info'}
                  />
                </div>
                <PixelButton
                  tone={showSettings ? 'accent' : 'ghost'}
                  onClick={() => setShowSettings(!showSettings)}
                  style={{ minHeight: 32, padding: '6px 12px', gap: 6 }}
                >
                  <Settings size={14} /> Настройки
                </PixelButton>
              </div>
            </div>
          </PixelSurface>
        </div>
      </header>

      {showSettings && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-8 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-2xl font-black text-gray-800">
                <Settings size={24} className="text-gray-400" /> Настройки
              </h2>
              <button onClick={() => setShowSettings(false)} className="rounded-full bg-gray-100 p-2 transition-colors hover:bg-gray-200">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Ключ Groq</label>
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(event) => setGroqApiKey(event.target.value)}
                  placeholder="Bearer xxxxxxxxxxxxxxxxx..."
                  className="w-full rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-mono text-sm transition-all outline-none focus:border-indigo-500 focus:bg-white"
                />
                <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                  <Sparkles size={16} className="mt-0.5 flex-shrink-0 text-amber-500" />
                  <p className="text-[10px] font-medium leading-relaxed text-amber-700">
                    AI помогает с переводом и примерами. Ключ:{' '}
                    <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="font-bold underline">
                      console.groq.com
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Я изучаю</label>
                <select
                  value={sourceLanguage}
                  onChange={(event) => setSourceLanguage(event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold text-gray-700 transition-all outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="English">Английский</option>
                  <option value="Russian">Русский</option>
                  <option value="Spanish">Испанский</option>
                  <option value="German">Немецкий</option>
                  <option value="French">Французский</option>
                  <option value="Chinese">Китайский</option>
                  <option value="Japanese">Японский</option>
                  <option value="Korean">Корейский</option>
                  <option value="Italian">Итальянский</option>
                  <option value="Portuguese">Португальский</option>
                  <option value="Turkish">Турецкий</option>
                  <option value="Ukrainian">Украинский</option>
                </select>
                <p className="mt-1 text-[10px] text-gray-400">Язык карточек.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Язык перевода</label>
                <select
                  value={targetLanguage}
                  onChange={(event) => setTargetLanguage(event.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-transparent bg-gray-50 p-4 font-bold text-gray-700 transition-all outline-none focus:border-indigo-500 focus:bg-white"
                >
                  <option value="Russian">Русский</option>
                  <option value="Spanish">Испанский</option>
                  <option value="German">Немецкий</option>
                  <option value="French">Французский</option>
                  <option value="Chinese">Китайский</option>
                  <option value="Japanese">Японский</option>
                  <option value="Korean">Корейский</option>
                  <option value="Italian">Итальянский</option>
                  <option value="Portuguese">Португальский</option>
                  <option value="Turkish">Турецкий</option>
                  <option value="Ukrainian">Украинский</option>
                </select>
                <p className="mt-1 text-[10px] text-gray-400">Куда переводить.</p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-gray-400">Данные</label>
                <button
                  onClick={() => {
                    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(words))}`;
                    const link = document.createElement('a');
                    link.href = dataStr;
                    link.download = `backup_${activeSubject?.name || 'db'}.json`;
                    link.click();
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-gray-50 py-4 font-bold text-gray-600 transition-all hover:bg-gray-100"
                >
                  <Download size={20} /> Экспорт {activeSubject?.name || 'данных'} в JSON
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="mt-10 w-full rounded-2xl bg-indigo-600 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-indigo-100 transition-all active:scale-[0.98] hover:bg-indigo-700"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      <main className="flex-grow w-full px-4 pb-4 pt-1 sm:px-6 sm:pb-6 sm:pt-1">
        <Suspense fallback={screenFallback}>
        {normalizedActiveTab === 'now' && (
          <NowView
            snapshot={nowSnapshot}
            focus={nowFocus}
            isLoading={nowLoading}
            isFocusLoading={nowFocusLoading}
            error={nowError}
            isCreatingStarter={nowCreatingStarter}
            onCreateStarterWorkspace={handleCreateStarterWorkspace}
            onSelectRecommendation={handleSelectNowRecommendation}
            onRefresh={loadNowDashboard}
          />
        )}

        {normalizedActiveTab === 'map' && (
          <NavigationView
            snapshot={navigationSnapshot}
            focus={navigationFocus}
            isLoading={navigationLoading}
            isFocusLoading={navigationFocusLoading}
            error={navigationError}
            isStartingSession={mapStartingSession}
            isCompletingAction={mapCompletingAction}
            activeOutcomeAction={mapActiveOutcomeAction}
            outcomeNote={mapOutcomeNote}
            barrierType={mapBarrierType}
            shrinkTitle={mapShrinkTitle}
            onRefresh={loadNavigationSnapshot}
            onSelectNode={handleSelectNavigationNode}
            onSelectAction={handleSelectNavigationAction}
            onStartSession={handleStartNavigationSession}
            onCompleteAction={handleCompleteNavigationAction}
            onDeferAction={handleDeferNavigationAction}
            onBlockAction={handleBlockNavigationAction}
            onShrinkAction={handleShrinkNavigationAction}
            onOutcomeNoteChange={setMapOutcomeNote}
            onBarrierTypeChange={setMapBarrierType}
            onShrinkTitleChange={setMapShrinkTitle}
            onSaveEditor={handleSaveNodeEditor}
            onDuplicateEditor={handleDuplicateNodeEditor}
            onArchiveEditor={handleArchiveNodeEditor}
            editorPendingAction={nodeEditorPendingAction}
            editorNotice={nodeEditorNotice}
            onCreateFollowUp={() =>
              handleCreateJournalFollowUp({
                nodeId: navigationFocus?.node?.id,
                title: `Следующий шаг: ${navigationFocus?.node?.title ?? 'узел'}`,
                note: mapOutcomeNote,
                barrierType: mapBarrierType,
              })
            }
          />
        )}
        </Suspense>
      </main>
    </div>
  );
}
