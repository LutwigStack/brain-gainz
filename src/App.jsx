import React, { useState, useEffect, useRef } from 'react';
import {
  Book,
  Brain,
  RotateCw,
  Volume2,
  Trash2,
  Plus,
  Check,
  X,
  Download,
  Settings,
  ChevronDown,
  Sparkles,
  LayoutGrid,
  Library,
  Compass,
  Map,
  BookOpenText
} from 'lucide-react';
import * as db from './db';
import { PixelButton, PixelMeter, PixelStack, PixelSurface, PixelText } from './components/pixel';
import { NowView } from './components/NowView';
import { NavigationView } from './components/NavigationView';
import { JournalView } from './components/JournalView';
import { getRuntimeProfile } from './platform/runtime.js';

// --- Components ---

const Card = ({ item, isFlipped, setIsFlipped, onCorrect, onIncorrect }) => {
  const utteranceRef = useRef(null);

  const speak = (e) => {
    e.stopPropagation();
    if (!item || !item.word) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(item.word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl h-96 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>

        {/* Front */}
        <div className="absolute w-full h-full bg-white rounded-2xl shadow-xl p-8 backface-hidden flex flex-col items-center justify-center border-2 border-indigo-50">
          <div className="absolute top-4 right-4 text-indigo-200">
            <RotateCw size={24} />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">{item.word}</h2>
          {item.transcription && (
            <span className="text-xl text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded-full">
              {item.transcription}
            </span>
          )}
          <button
            onClick={speak}
            className="mt-8 p-3 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors"
          >
            <Volume2 size={24} />
          </button>
          <p className="absolute bottom-6 text-gray-400 text-sm font-medium">Нажмите, чтобы перевернуть</p>
        </div>

        {/* Back */}
        <div className="absolute w-full h-full bg-indigo-600 rounded-2xl shadow-xl p-8 backface-hidden rotate-y-180 flex flex-col items-center justify-between text-white">
          <div className="flex flex-col items-center flex-grow justify-center overflow-y-auto w-full px-4">
            <h3 className="text-2xl font-bold mb-2 text-center">{item.translation || 'Без перевода'}</h3>
            <div className="w-16 h-1 bg-indigo-400 rounded-full my-4"></div>
            <p className="text-lg text-center italic opacity-90">
              "{item.example || 'Без примера'}"
            </p>
            {item.definition && (
              <p className="text-sm text-center mt-4 text-indigo-200 px-4">
                Значение: {item.definition}
              </p>
            )}
            {item.category && (
              <span className="mt-4 px-3 py-1 bg-indigo-500 text-xs rounded-full uppercase tracking-wider font-bold border border-indigo-400">
                {item.category}
              </span>
            )}
          </div>

          <div className="flex gap-4 w-full mt-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={onIncorrect}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <X size={20} /> Повторить
            </button>
            <button
              onClick={onCorrect}
              className="flex-1 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
            >
              <Check size={20} /> Знаю
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const runtime = getRuntimeProfile();
  const [activeTab, setActiveTab] = useState('now');
  const [subjects, setSubjects] = useState([]);
  const [activeSubject, setActiveSubject] = useState(null);
  const [words, setWords] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [groqApiKey, setGroqApiKey] = useState(localStorage.getItem('braingainz_groq_key') || '');
  const [targetLanguage, setTargetLanguage] = useState(localStorage.getItem('braingainz_target_lang') || 'Russian');
  const [sourceLanguage, setSourceLanguage] = useState(localStorage.getItem('braingainz_source_lang') || 'English');
  const [showSettings, setShowSettings] = useState(false);
  const [showSubjectManager, setShowSubjectManager] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [newSubjectName, setNewSubjectName] = useState('');

  // Study Mode State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyQueue, setStudyQueue] = useState([]);
  const [finished, setFinished] = useState(false);

  // Import State
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importError, setImportError] = useState(null);
  const cancelImportRef = React.useRef(false);
  const [nowSnapshot, setNowSnapshot] = useState(null);
  const [nowLoading, setNowLoading] = useState(false);
  const [nowError, setNowError] = useState(null);
  const [nowCreatingStarter, setNowCreatingStarter] = useState(false);
  const [nowStartingSession, setNowStartingSession] = useState(false);
  const [nowCompletingAction, setNowCompletingAction] = useState(false);
  const [nowActiveOutcomeAction, setNowActiveOutcomeAction] = useState(null);
  const [nowFocus, setNowFocus] = useState(null);
  const [nowFocusLoading, setNowFocusLoading] = useState(false);
  const [nowSelection, setNowSelection] = useState(null);
  const [nowOutcomeNote, setNowOutcomeNote] = useState('');
  const [nowBarrierType, setNowBarrierType] = useState('too complex');
  const [nowShrinkTitle, setNowShrinkTitle] = useState('');
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
  const [journalSnapshot, setJournalSnapshot] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState(null);

  // Initialize DB and load data
  useEffect(() => {
    const init = async () => {
      try {
        await db.initDb();
        const subs = await db.getSubjects();
        setSubjects(subs);
        if (subs.length > 0) {
          const lastSubId = localStorage.getItem('braingainz_last_subject_id');
          const lastSub = subs.find(s => s.id === parseInt(lastSubId)) || subs[0];
          setActiveSubject(lastSub);
        }
      } catch (e) {
        console.error("DB Initialization error", e);
      }
    };
    init();
  }, []);

  // Load words when active subject changes
  useEffect(() => {
    if (activeSubject) {
      localStorage.setItem('braingainz_last_subject_id', activeSubject.id);
      db.getCards(activeSubject.id).then(setWords);
    }
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

  const loadJournalSnapshot = async () => {
    setJournalLoading(true);
    setJournalError(null);

    try {
      const snapshot = await db.getJournalSnapshot();
      setJournalSnapshot(snapshot);
    } catch (error) {
      console.error('Failed to load journal snapshot', error);
      setJournalError(error.message || 'Не удалось загрузить журнал.');
    } finally {
      setJournalLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'now') {
      void loadNowDashboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'map') {
      void loadNavigationSnapshot();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'journal') {
      void loadJournalSnapshot();
    }
  }, [activeTab]);

  const enrichWithGroq = async (word, subjectName) => {
    if (!groqApiKey) return null;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a study assistant. The user is learning ${sourceLanguage}. 
              The subject of study is: ${subjectName}. 
              For the given ${sourceLanguage} term, return a JSON object with: 
              "transcription" (IPA or phonetic guidance for ${sourceLanguage}), 
              "translation" (translation FROM ${sourceLanguage} TO ${targetLanguage}), 
              "definition" (In-depth explanation in ${targetLanguage}), 
              "example" (Contextual usage sentence in ${sourceLanguage}), 
              "category" (A relevant sub-category for this term). 
              Return ONLY JSON.`
            },
            {
              role: 'user', content: word
            }
          ],
          response_format: { type: "json_object" }
        })
      });

      if (response.status === 401) {
        throw new Error('Неверный ключ Groq. Проверьте его в настройках.');
      }
      if (response.status === 429) {
        throw new Error('Лимит запросов исчерпан. Перехожу в офлайн.');
      }
      if (!response.ok) {
        throw new Error(`Ошибка API (${response.status}). Перехожу в офлайн.`);
      }

      const data = await response.json();
      const content = JSON.parse(data.choices[0].message.content);
      return {
        success: true,
        data: {
          word,
          transcription: content.transcription || '',
          translation: content.translation || '',
          definition: content.definition || '',
          example: content.example || '',
          category: content.category || 'General'
        }
      };
    } catch (e) {
      console.error("AI enrichment failed:", e.message);
      return { success: false, error: e.message };
    }
  };

  const enrichWord = async (word, useOffline = false) => {
    const subjectName = activeSubject ? activeSubject.name : 'General';

    // Try AI first (unless forced offline)
    if (!useOffline && groqApiKey) {
      const result = await enrichWithGroq(word, subjectName);
      if (result.success) return { success: true, data: result.data };
      // Return error for caller to handle fallback logic
      return result;
    }

    // Offline fallback (English only)
    if (sourceLanguage.toLowerCase() === 'english') {
      try {
        let phonetic = '', definition = '', example = '';
        try {
          const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
          if (dictResponse.ok) {
            const dictData = await dictResponse.json();
            if (Array.isArray(dictData)) {
              const entry = dictData[0];
              phonetic = entry.phonetic || (entry.phonetics.find(p => p.text)?.text) || '';
              if (entry.meanings && entry.meanings.length > 0) {
                const m = entry.meanings[0];
                definition = m.definitions[0]?.definition || '';
                example = m.definitions.find(d => d.example)?.example || '';
              }
            }
          }
        } catch {
          // Ignore dictionary API failures and keep offline fallback best-effort.
        }

        let translation = '';
        try {
          const langCode = targetLanguage === 'Russian' ? 'ru' : targetLanguage.substring(0, 2).toLowerCase();
          const transResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|${langCode}`);
          const transData = await transResponse.json();
          translation = transData?.responseData?.translatedText || '';
        } catch {
          // Ignore translation API failures and return partial data when needed.
        }

        return { success: true, data: { word, transcription: phonetic, definition, example, translation, category: 'General' } };
      } catch {
        // Ignore fallback enrichment failures and return the minimal word payload below.
      }
    }

    return { success: true, data: { word, transcription: '', translation: '', example: '', definition: '', category: 'General' } };
  };

  const handleBulkImport = async () => {
    if (!activeSubject) return;

    cancelImportRef.current = false;
    setImportError(null);
    setIsLoading(true);

    const lines = inputText.split(/\n/).filter(line => line.trim().length > 0);
    const termsToProcess = lines.map(line => line.split(/[–-]/)[0].trim()).filter(t => t && !words.some(w => w.word.toLowerCase() === t.toLowerCase()));

    setImportProgress({ current: 0, total: termsToProcess.length });

    let useOffline = false;
    let apiErrorShown = false;

    for (let i = 0; i < termsToProcess.length; i++) {
      if (cancelImportRef.current) {
        setImportError('Импорт остановлен.');
        break;
      }

      const term = termsToProcess[i];
      setImportProgress({ current: i + 1, total: termsToProcess.length });

      const result = await enrichWord(term, useOffline);

      if (!result.success) {
        // Show error to user once, then switch to offline
        if (!apiErrorShown) {
          setImportError(result.error + ' Продолжаю без AI.');
          apiErrorShown = true;
          useOffline = true;
        }
        // Retry in offline mode
        const offlineResult = await enrichWord(term, true);
        if (offlineResult.success) {
          await db.addCard({ ...offlineResult.data, subject_id: activeSubject.id });
        }
      } else {
        await db.addCard({ ...result.data, subject_id: activeSubject.id });
      }

      // Small delay to prevent overwhelming
      await new Promise(r => setTimeout(r, 50));
    }

    const updatedWords = await db.getCards(activeSubject.id);
    setWords(updatedWords);
    setInputText('');
    setIsLoading(false);
    setImportProgress({ current: 0, total: 0 });
    setActiveTab('list');
  };

  const cancelImport = () => {
    cancelImportRef.current = true;
  };

  const deleteWord = async (id) => {
    await db.deleteCard(id);
    setWords(words.filter(w => w.id !== id));
  };

  const handleUpdateWord = async (id, field, value) => {
    const wordToUpdate = words.find(w => w.id === id);
    const updatedWord = { ...wordToUpdate, [field]: value };
    await db.updateCard(id, updatedWord);
    setWords(words.map(w => w.id === id ? updatedWord : w));
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;
    try {
      await db.addSubject(newSubjectName, '📚');
      const subs = await db.getSubjects();
      setSubjects(subs);
      setNewSubjectName('');
      setShowSubjectManager(false);
    } catch (e) {
      console.error("Failed to add subject:", e);
      alert(`Не удалось создать тему: ${e.message || e}`);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (subjects.length <= 1) return;
    if (confirm('Удалить тему и все ее карточки?')) {
      await db.deleteSubject(id);
      const subs = await db.getSubjects();
      setSubjects(subs);
      if (activeSubject.id === id) {
        setActiveSubject(subs[0]);
      }
    }
  };

  const startStudy = () => {
    if (words.length === 0) return;
    setStudyQueue([...words].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setFinished(false);
    setActiveTab('study');
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < studyQueue.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setFinished(true);
      }
    }, 300);
  };

  const toggleCategory = (cat) => {
    setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

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

    const nextNowSelection = result.focus?.selectedAction
      ? { nodeId: result.focus.node.id, actionId: result.focus.selectedAction.id }
      : result.focus?.node
        ? { nodeId: result.focus.node.id, actionId: null }
        : null;

    setNowSelection(nextNowSelection);
    setNavigationSelection(nextNowSelection);
    await loadNavigationSnapshot(nextNowSelection);
    await loadJournalSnapshot();
    setNowOutcomeNote('');
    setNowShrinkTitle('');
    setMapOutcomeNote('');
    setMapShrinkTitle('');
  };

  const handleStartNowSession = async () => {
    setNowStartingSession(true);
    setNowError(null);

    try {
      await db.startTodaySessionFromRecommendation(nowSelection?.actionId ?? null);
      await loadNowDashboard(nowSelection);
    } catch (error) {
      console.error('Failed to start daily session', error);
      setNowError(error.message || 'Не удалось запустить сессию.');
    } finally {
      setNowStartingSession(false);
    }
  };

  const runNowOutcome = async (type, operation) => {
    if (!nowSelection?.actionId) {
      return;
    }

    setNowActiveOutcomeAction(type);
    setNowError(null);

    try {
      const result = await operation();
      await applyOutcomeResult(result);
    } catch (error) {
      console.error(`Failed to ${type} action`, error);
      setNowError(error.message || 'Не удалось изменить шаг.');
    } finally {
      setNowActiveOutcomeAction(null);
    }
  };

  const handleSelectNowRecommendation = async (recommendation) => {
    const selection = {
      nodeId: recommendation.nodeId,
      actionId: recommendation.actionId,
    };

    setNowSelection(selection);
    setNowError(null);
    await loadNowFocus(selection);
  };

  const handleCompleteNowAction = async () => {
    if (!nowSelection?.actionId) {
      return;
    }

    setNowCompletingAction(true);
    setNowError(null);

    try {
      const result = await db.completeNowActionInTodaySession(nowSelection.actionId);
      await applyOutcomeResult(result);
    } catch (error) {
      console.error('Failed to complete action', error);
      setNowError(error.message || 'Не удалось завершить шаг.');
    } finally {
      setNowCompletingAction(false);
    }
  };

  const handleDeferNowAction = async () => {
    await runNowOutcome('defer', () => db.deferNowActionInTodaySession(nowSelection.actionId, nowOutcomeNote));
  };

  const handleBlockNowAction = async () => {
    await runNowOutcome('block', () =>
      db.blockNowActionInTodaySession(nowSelection.actionId, {
        barrierType: nowBarrierType,
        note: nowOutcomeNote,
      }),
    );
  };

  const handleShrinkNowAction = async () => {
    await runNowOutcome('shrink', () =>
      db.shrinkNowActionInTodaySession(nowSelection.actionId, {
        title: nowShrinkTitle,
        note: nowOutcomeNote,
      }),
    );
  };

  const handleSelectNavigationNode = async (node) => {
    const selection = {
      nodeId: node.id,
      actionId: node.next_action_id ?? null,
    };

    setNavigationSelection(selection);
    setNavigationError(null);
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
    await loadNavigationFocus(selection);
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
      await loadJournalSnapshot();
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
    await runNavigationOutcome('defer', () => db.deferNowActionInTodaySession(navigationSelection.actionId, mapOutcomeNote));
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

  const handleOpenJournalNode = async (nodeId, actionId = null) => {
    const selection = { nodeId, actionId };
    setActiveTab('map');
    setNavigationSelection(selection);
    await loadNavigationSnapshot(selection);
  };

  const handleOpenJournal = async () => {
    setActiveTab('journal');
    await loadJournalSnapshot();
  };

  const handleCreateJournalFollowUp = async (payload) => {
    setJournalError(null);

    try {
      const result = await db.createJournalFollowUpStep(payload);
      await applyOutcomeResult(result);
      setActiveTab('map');
    } catch (error) {
      console.error('Failed to create journal follow-up', error);
      setJournalError(error.message || 'Не удалось создать следующий шаг из журнала.');
    }
  };

  const groupedWords = words.reduce((acc, w) => {
    const cat = w.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(w);
    return acc;
  }, {});

  return (
    <div
      className="pixel-shell-grid flex min-h-[100dvh] flex-col text-[var(--pixel-text)]"
      style={{
        paddingBottom: runtime.usesSafeAreaInsets ? 'env(safe-area-inset-bottom)' : undefined,
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 px-3 pb-3 pt-3 sm:px-4"
        style={{
          paddingTop: runtime.usesSafeAreaInsets ? 'max(0.75rem, env(safe-area-inset-top))' : undefined,
        }}
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 sm:gap-4">
          <PixelSurface frame="panel" padding="md">
            <PixelStack gap="md">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <PixelSurface frame="accent" padding="sm" fullWidth={false}>
                    <Brain size={24} className="text-[var(--pixel-accent-glow)]" />
                  </PixelSurface>
                  <PixelStack gap="xs">
                    <PixelText as="h1" size="lg" style={{ margin: 0 }}>
                      BrainGainz
                    </PixelText>
                    <div className="flex flex-wrap items-center gap-2">
                      <PixelText as="span" size="xs" color="textMuted" uppercase>
                        {runtime.shellLabel}
                      </PixelText>
                      <PixelText as="span" size="xs" color="textDim" uppercase>
                        {runtime.storageLabel}
                      </PixelText>
                    </div>
                  </PixelStack>
                </div>

                <div className="flex items-center gap-3">
                  <div className="min-w-[180px]">
                    <PixelMeter
                      value={runtime.isLocalFirst ? 72 : 48}
                      max={100}
                      label={runtime.isLocalFirst ? 'Local-first sync' : 'Web-first shell'}
                      tone={runtime.isLocalFirst ? 'success' : 'info'}
                    />
                  </div>
                  <PixelButton tone={showSettings ? 'accent' : 'ghost'} onClick={() => setShowSettings(!showSettings)}>
                    <Settings size={16} /> Settings
                  </PixelButton>
                </div>
              </div>

              <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1" role="navigation" aria-label="Основные разделы BrainGainz">
                <PixelButton
                  tone={activeTab === 'now' ? 'accent' : 'panel'}
                  onClick={() => setActiveTab('now')}
                  aria-pressed={activeTab === 'now'}
                  aria-current={activeTab === 'now' ? 'page' : undefined}
                >
                  <Compass size={16} /> Сейчас
                </PixelButton>
                <PixelButton
                  tone={activeTab === 'map' ? 'accent' : 'panel'}
                  onClick={() => setActiveTab('map')}
                  aria-pressed={activeTab === 'map'}
                  aria-current={activeTab === 'map' ? 'page' : undefined}
                >
                  <Map size={16} /> Карта
                </PixelButton>
                <PixelButton
                  tone={activeTab === 'journal' ? 'accent' : 'panel'}
                  onClick={() => setActiveTab('journal')}
                  aria-pressed={activeTab === 'journal'}
                  aria-current={activeTab === 'journal' ? 'page' : undefined}
                >
                  <BookOpenText size={16} /> Журнал
                </PixelButton>
                <PixelButton
                  tone={activeTab === 'list' ? 'accent' : 'panel'}
                  onClick={() => setActiveTab('list')}
                  aria-pressed={activeTab === 'list'}
                  aria-current={activeTab === 'list' ? 'page' : undefined}
                >
                  <Library size={16} /> Словарь
                </PixelButton>
                <PixelButton
                  tone={activeTab === 'study' ? 'accent' : 'panel'}
                  onClick={startStudy}
                  aria-pressed={activeTab === 'study'}
                  aria-current={activeTab === 'study' ? 'page' : undefined}
                >
                  <Sparkles size={16} /> Повтор
                </PixelButton>
              </div>
            </PixelStack>
          </PixelSurface>
        </div>
      </header>

      {/* Subject Manager Modal */}
      {showSubjectManager && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Library size={24} className="text-indigo-500" /> Темы
              </h2>
              <button onClick={() => setShowSubjectManager(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 mb-8">
              {subjects.map(s => (
                <div key={s.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl group active:scale-95 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="font-bold text-gray-700 uppercase tracking-wide">{s.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(s.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Новая тема"
                  className="flex-grow p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all"
                />
                <button
                  onClick={handleAddSubject}
                  className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-90"
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                <Settings size={24} className="text-gray-400" /> Настройки
              </h2>
              <button onClick={() => setShowSettings(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Ключ Groq</label>
                <input
                  type="password"
                  value={groqApiKey}
                  onChange={(e) => setGroqApiKey(e.target.value)}
                  placeholder="Bearer xxxxxxxxxxxxxxxxx..."
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-mono text-sm transition-all"
                />
                <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <Sparkles size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                    AI помогает с переводом и примерами. Ключ: <a href="https://console.groq.com" target="_blank" className="font-bold underline">console.groq.com</a>.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Я изучаю</label>
                <select
                  value={sourceLanguage}
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="English">🇬🇧 English</option>
                  <option value="Russian">🇷🇺 Русский (Russian)</option>
                  <option value="Spanish">🇪🇸 Español (Spanish)</option>
                  <option value="German">🇩🇪 Deutsch (German)</option>
                  <option value="French">🇫🇷 Français (French)</option>
                  <option value="Chinese">🇨🇳 中文 (Chinese)</option>
                  <option value="Japanese">🇯🇵 日本語 (Japanese)</option>
                  <option value="Korean">🇰🇷 한국어 (Korean)</option>
                  <option value="Italian">🇮🇹 Italiano (Italian)</option>
                  <option value="Portuguese">🇵🇹 Português (Portuguese)</option>
                  <option value="Turkish">🇹🇷 Türkçe (Turkish)</option>
                  <option value="Ukrainian">🇺🇦 Українська (Ukrainian)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Язык карточек.</p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Язык перевода</label>
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none font-bold transition-all text-gray-700 appearance-none cursor-pointer"
                >
                  <option value="Russian">Русский (Russian)</option>
                  <option value="Spanish">Español (Spanish)</option>
                  <option value="German">Deutsch (German)</option>
                  <option value="French">Français (French)</option>
                  <option value="Chinese">中文 (Chinese)</option>
                  <option value="Japanese">日本語 (Japanese)</option>
                  <option value="Korean">한국어 (Korean)</option>
                  <option value="Italian">Italiano (Italian)</option>
                  <option value="Portuguese">Português (Portuguese)</option>
                  <option value="Turkish">Türkçe (Turkish)</option>
                  <option value="Ukrainian">Українська (Ukrainian)</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1">Куда переводить.</p>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Данные</label>
                <button
                  onClick={() => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(words));
                    const link = document.createElement('a');
                    link.href = dataStr;
                    link.download = `backup_${activeSubject?.name || 'db'}.json`;
                    link.click();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all border-2 border-transparent"
                >
                  <Download size={20} /> Экспорт {activeSubject?.name} в JSON
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              className="w-full mt-10 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
            >
              Сохранить
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="mx-auto flex-grow w-full max-w-[1440px] p-4 sm:p-8">

        {activeTab === 'now' && (
          <NowView
            snapshot={nowSnapshot}
            focus={nowFocus}
            isLoading={nowLoading}
            isFocusLoading={nowFocusLoading}
            error={nowError}
            isCreatingStarter={nowCreatingStarter}
            isStartingSession={nowStartingSession}
            isCompletingAction={nowCompletingAction}
            activeOutcomeAction={nowActiveOutcomeAction}
            outcomeNote={nowOutcomeNote}
            barrierType={nowBarrierType}
            shrinkTitle={nowShrinkTitle}
            onCreateStarterWorkspace={handleCreateStarterWorkspace}
            onStartSession={handleStartNowSession}
            onCompleteAction={handleCompleteNowAction}
            onDeferAction={handleDeferNowAction}
            onBlockAction={handleBlockNowAction}
            onShrinkAction={handleShrinkNowAction}
            onSelectRecommendation={handleSelectNowRecommendation}
            onOutcomeNoteChange={setNowOutcomeNote}
            onBarrierTypeChange={setNowBarrierType}
            onShrinkTitleChange={setNowShrinkTitle}
            onRefresh={loadNowDashboard}
          />
        )}

        {activeTab === 'map' && (
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
            onOpenJournal={handleOpenJournal}
            onCreateFollowUp={() =>
              handleCreateJournalFollowUp({
                nodeId: navigationFocus?.node?.id,
                title: mapShrinkTitle || `Следующий шаг: ${navigationFocus?.node?.title ?? 'узел'}`,
                note: mapOutcomeNote,
                barrierType: mapBarrierType,
              })
            }
          />
        )}

        {activeTab === 'journal' && (
          <JournalView
            snapshot={journalSnapshot}
            isLoading={journalLoading}
            error={journalError}
            onRefresh={loadJournalSnapshot}
            onOpenNode={handleOpenJournalNode}
            onCreateFollowUp={handleCreateJournalFollowUp}
          />
        )}

        {/* VIEW: Dictionary List */}
        {activeTab === 'list' && (
          <div className="space-y-10">

            {/* Quick Add Area */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-focus-within:opacity-30 transition-opacity">
                <Plus size={120} className="text-indigo-600" />
              </div>

              <div className="flex items-center justify-between mb-6 relative">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                  <Plus size={28} className="text-indigo-500" /> Импорт
                </h2>
                {groqApiKey ? (
                  <span className="flex items-center gap-1.5 text-[10px] bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full font-black border border-indigo-100 uppercase tracking-widest">
                    <Sparkles size={12} /> AI включен
                  </span>
                ) : (
                  <span className="text-[10px] bg-red-50 text-red-500 px-4 py-1.5 rounded-full font-black border border-red-100 uppercase tracking-widest">
                    AI выкл
                  </span>
                )}
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Вставьте слова построчно&#10;Пример: word - перевод`}
                className="w-full p-6 bg-gray-50 border-2 border-transparent rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 focus:bg-white min-h-[160px] outline-none font-medium transition-all text-gray-700 relative"
              />

              <div className="mt-6 flex flex-col gap-4 relative">
                {/* Error Message */}
                {importError && (
                  <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-sm font-bold flex items-start gap-3">
                    <X size={20} className="flex-shrink-0 mt-0.5" />
                    <span>{importError}</span>
                  </div>
                )}

                {/* Progress Bar (when loading) */}
                {isLoading && importProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                      <span>Обработка</span>
                      <span>{importProgress.current} / {importProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-2">
                    <Library size={14} /> Тема: <span className="text-indigo-600">{activeSubject?.name}</span>
                  </p>
                  <div className="flex gap-3">
                    {isLoading && (
                      <button
                        onClick={cancelImport}
                        className="px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-red-600 bg-red-50 border-2 border-red-200 hover:bg-red-100 transition-all flex items-center gap-2"
                      >
                        <X size={18} /> Отмена
                      </button>
                    )}
                    <button
                      onClick={handleBulkImport}
                      disabled={isLoading || !inputText.trim() || !activeSubject}
                      className={`px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-white transition-all flex items-center gap-3 shadow-xl ${isLoading ? 'bg-gray-200 cursor-not-allowed text-gray-400 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100 hover:scale-105 active:scale-95'}`}
                    >
                      {isLoading ? `Идет... (${importProgress.current}/${importProgress.total})` : 'Импорт'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Word List Table by Category */}
            <div className="space-y-6">
              <div className="flex justify-between items-center px-4">
                <h3 className="text-xl font-black text-gray-800 uppercase tracking-tight flex items-center gap-2">
                  <Book size={20} className="text-indigo-500" /> {activeSubject?.name}
                </h3>
              </div>

              {words.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-[2.5rem] border-4 border-dashed border-gray-100 group transition-all">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Book size={48} className="text-gray-200" />
                  </div>
                  <p className="font-black text-gray-300 uppercase tracking-widest text-sm">Пока пусто</p>
                </div>
              ) : (
                Object.keys(groupedWords).sort().map(category => (
                  <div key={category} className="bg-white rounded-[2rem] shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full flex items-center justify-between p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors border-b border-gray-100"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg transition-transform ${expandedCategories[category] ? 'rotate-0' : '-rotate-90'}`}>
                          <ChevronDown size={20} className="text-indigo-400" />
                        </div>
                        <span className="font-black text-indigo-900 uppercase tracking-wider text-sm">{category}</span>
                        <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full border border-indigo-200">
                          {groupedWords[category].length}
                        </span>
                      </div>
                    </button>

                    {!expandedCategories[category] && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <tbody className="divide-y divide-gray-50">
                            {groupedWords[category].map((item) => (
                              <tr key={item.id} className="hover:bg-indigo-50/30 group transition-all">
                                <td className="p-6 align-top w-1/4">
                                  <input
                                    className="font-black text-gray-800 bg-transparent w-full focus:outline-none focus:text-indigo-700 uppercase tracking-tight text-sm"
                                    value={item.word}
                                    onChange={(e) => handleUpdateWord(item.id, 'word', e.target.value)}
                                  />
                                  <input
                                    className="text-xs text-gray-400 font-mono mt-2 bg-transparent w-full focus:outline-none"
                                    value={item.transcription}
                                    onChange={(e) => handleUpdateWord(item.id, 'transcription', e.target.value)}
                                    placeholder="/.../"
                                  />
                                </td>
                                <td className="p-6 align-top w-1/4">
                                  <textarea
                                    className="w-full bg-transparent resize-none focus:bg-white focus:ring-4 focus:ring-indigo-50 rounded-xl p-2 text-sm outline-none font-bold text-gray-600 transition-all border-2 border-transparent"
                                    rows="2"
                                    value={item.translation || ''}
                                    onChange={(e) => handleUpdateWord(item.id, 'translation', e.target.value)}
                                  />
                                </td>
                                <td className="p-6 align-top flex-grow">
                                  <textarea
                                    className="w-full bg-transparent resize-none italic text-gray-500 focus:bg-white focus:ring-4 focus:ring-indigo-50 rounded-xl p-2 text-sm outline-none transition-all border-2 border-transparent"
                                    rows="2"
                                    value={item.example || ''}
                                    onChange={(e) => handleUpdateWord(item.id, 'example', e.target.value)}
                                  />
                                  {item.definition && (
                                    <div className="text-[10px] text-gray-400 mt-2 font-medium opacity-60 leading-relaxed max-w-lg" title={item.definition}>
                                      {item.definition}
                                    </div>
                                  )}
                                </td>
                                <td className="p-6 align-middle text-right w-16">
                                  <button
                                    onClick={() => deleteWord(item.id)}
                                    className="text-gray-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-xl"
                                  >
                                    <Trash2 size={20} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: Study Mode */}
        {activeTab === 'study' && (
          <div className="h-full flex flex-col items-center justify-center py-10">
            {!finished ? (
              <>
                <div className="mb-8 flex justify-between w-full max-w-2xl text-xs font-black text-gray-400 px-4 uppercase tracking-[0.2em]">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                    Тема: {activeSubject?.name}
                  </span>
                  <span>{currentIndex + 1} / {studyQueue.length}</span>
                </div>

                <div className="w-full max-w-2xl mb-12 bg-white rounded-full h-4 shadow-inner border border-gray-100 overflow-hidden p-1">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-700 ease-out shadow-lg shadow-indigo-200"
                    style={{ width: `${((currentIndex) / studyQueue.length) * 100}%` }}
                  ></div>
                </div>

                <Card
                  item={studyQueue[currentIndex]}
                  isFlipped={isFlipped}
                  setIsFlipped={setIsFlipped}
                  onCorrect={handleNextCard}
                  onIncorrect={handleNextCard}
                />

                <p className="mt-12 text-indigo-300 text-[10px] font-black flex items-center gap-3 uppercase tracking-widest animate-pulse">
                  <Volume2 size={16} /> Нажмите на звук
                </p>
              </>
            ) : (
              <div className="text-center py-16 bg-white rounded-[3rem] shadow-2xl p-12 max-w-md w-full border border-indigo-50 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-50 rounded-full blur-3xl" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-green-50 rounded-full blur-3xl" />

                <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 shadow-inner">
                  <Check size={56} strokeWidth={3} />
                </div>
                <h2 className="text-4xl font-black text-gray-800 mb-4 tracking-tighter italic">Готово</h2>
                <p className="text-gray-400 mb-10 font-bold uppercase tracking-widest text-xs">Сессия по теме {activeSubject?.name} завершена.</p>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={startStudy}
                    className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-2xl shadow-indigo-100 active:scale-95 transition-all"
                  >
                    Еще раз
                  </button>
                  <button
                    onClick={() => setActiveTab('list')}
                    className="w-full py-5 bg-gray-50 text-gray-500 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-gray-100 transition-all border-2 border-transparent"
                  >
                    К словарю
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
