import { AlertTriangle, BookOpenText, RefreshCw, Scissors } from 'lucide-react';
import type { JournalFollowUpPayload, JournalSnapshot } from '../types/app-shell';

const eventStyles: Record<string, string> = {
  blocked: 'border-rose-200 bg-rose-50 text-rose-700',
  shrunk: 'border-amber-200 bg-amber-50 text-amber-700',
  deferred: 'border-gray-200 bg-gray-50 text-gray-700',
};

const eventLabels: Record<string, string> = {
  blocked: 'барьер',
  shrunk: 'упростили',
  deferred: 'отложили',
  follow_up: 'следующий шаг',
  error: 'ошибка',
};

const barrierLabels: Record<string, string> = {
  'too complex': 'Слишком сложно',
  'unclear next step': 'Непонятен следующий шаг',
  'low energy': 'Нет сил',
  'aversive / scary to start': 'Тяжело начать',
  'wrong time / wrong context': 'Не тот момент',
};

const eventLabel = (value: string) => eventLabels[value] ?? value;
const barrierLabel = (value: string) => barrierLabels[value] ?? 'Без типа';

interface JournalViewProps {
  snapshot: JournalSnapshot | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
  onOpenNode: (nodeId: number) => void;
  onCreateFollowUp: (payload: JournalFollowUpPayload) => void;
}

export const JournalView = ({ snapshot, isLoading, error, onRefresh, onOpenNode, onCreateFollowUp }: JournalViewProps) => {
  const barrierSummary = snapshot?.barrierSummary ?? [];
  const barrierEntries = snapshot?.barrierEntries ?? [];
  const adjustmentEntries = snapshot?.adjustmentEntries ?? [];
  const hotspots = snapshot?.hotspots ?? [];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-8 shadow-xl">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-50 blur-3xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-[11px] font-black uppercase tracking-[0.35em] text-amber-400">Журнал</p>
            <h2 className="flex items-center gap-3 text-3xl font-black tracking-tight text-gray-900">
              <BookOpenText size={30} className="text-amber-500" /> Что мешает двигаться
            </h2>
            <p className="text-sm text-gray-500">Здесь видны барьеры, откладывания и упрощения.</p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} /> Обновить
          </button>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">{error}</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {barrierSummary.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-amber-200 bg-amber-50/40 p-5 text-sm text-gray-500 md:col-span-2 xl:col-span-5">
              Пока пусто.
            </div>
          ) : (
            barrierSummary.map((item) => (
              <div key={item.barrierType} className="rounded-[1.75rem] border border-gray-100 bg-gray-50 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">Барьер</p>
                <p className="mt-3 text-lg font-black tracking-tight text-gray-900">{barrierLabel(item.barrierType)}</p>
                <p className="mt-3 text-xs font-black uppercase tracking-[0.25em] text-amber-500">{item.count} раз</p>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.15fr)_minmax(0,1.15fr)]">
        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-lg">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            <AlertTriangle size={14} className="text-rose-400" /> Повторы
          </p>

          <div className="mt-4 space-y-3">
            {hotspots.length === 0 ? (
              <p className="text-sm text-gray-500">Пока нет.</p>
            ) : (
              hotspots.map((item) => (
                <div key={item.nodeId} className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4">
                  <p className="text-sm font-black text-gray-900">{item.nodeTitle}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    {item.incidentCount} раз · {item.blockedCount} барьеров · {item.shrunkCount} упрощений · {item.deferredCount} откладываний
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenNode(item.nodeId)}
                      className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600 transition-all hover:bg-gray-100"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => onCreateFollowUp({ nodeId: item.nodeId, title: `Следующий шаг: ${item.nodeTitle}`, note: 'Создано из повтора в журнале.' })}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 transition-all hover:bg-amber-100"
                    >
                      Следующий шаг
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-lg">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            <AlertTriangle size={14} className="text-rose-400" /> Барьеры
          </p>

          <div className="mt-4 space-y-3">
            {barrierEntries.length === 0 ? (
              <p className="text-sm text-gray-500">Пока нет.</p>
            ) : (
              barrierEntries.map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4">
                  <p className="text-sm font-black text-gray-900">{entry.nodeTitle}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-rose-600">{barrierLabel(entry.barrierType ?? 'barrier')}</p>
                  <p className="mt-3 text-xs text-gray-600">{entry.note || 'Без заметки.'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenNode(entry.nodeId)}
                      className="rounded-xl border border-white/80 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-700 transition-all hover:bg-rose-100"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => onCreateFollowUp({ nodeId: entry.nodeId, title: `Разобрать барьер: ${barrierLabel(entry.barrierType ?? 'barrier')}`, note: entry.note ?? undefined, barrierType: entry.barrierType })}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 transition-all hover:bg-amber-100"
                    >
                      Следующий шаг
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-lg">
          <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-gray-400">
            <Scissors size={14} className="text-amber-400" /> Изменения
          </p>

          <div className="mt-4 space-y-3">
            {adjustmentEntries.length === 0 ? (
              <p className="text-sm text-gray-500">Пока нет.</p>
            ) : (
              adjustmentEntries.map((entry) => (
                <div key={entry.id} className={`rounded-2xl border px-4 py-4 ${eventStyles[entry.eventType] ?? 'border-gray-100 bg-gray-50 text-gray-700'}`}>
                  <p className="text-sm font-black text-gray-900">{entry.nodeTitle}</p>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-widest">{eventLabel(entry.eventType)}</p>
                  <p className="mt-3 text-xs text-gray-600">{entry.note || 'Без заметки.'}</p>
                  {entry.actionTitle && <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-gray-500">{entry.actionTitle}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() => onOpenNode(entry.nodeId)}
                      className="rounded-xl border border-white/80 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-700 transition-all hover:bg-gray-100"
                    >
                      Открыть
                    </button>
                    <button
                      onClick={() => onCreateFollowUp({ nodeId: entry.nodeId, title: `Следующий шаг после: ${eventLabel(entry.eventType)}`, note: entry.note ?? undefined })}
                      className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-amber-700 transition-all hover:bg-amber-100"
                    >
                      Следующий шаг
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
