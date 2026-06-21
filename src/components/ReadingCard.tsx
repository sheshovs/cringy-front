import type { Reading } from '../types'

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ: 'Quiero leerlo',
  READING: 'Leyendo',
  FINISHED: 'Terminado',
  DROPPED: 'Abandonado',
}

const STATUS_COLORS: Record<string, string> = {
  WANT_TO_READ: '#1a3028',
  READING:      '#0f2535',
  FINISHED:     '#0d2a1a',
  DROPPED:      '#2a1020',
}

interface ReadingCardProps {
  reading: Reading
  onEdit?: () => void
  onDelete?: () => void
  canEdit?: boolean
}

export function ReadingCard({ reading, onEdit, onDelete, canEdit }: ReadingCardProps) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-surface)] hover:shadow-lg hover:shadow-black/30 transition-shadow overflow-hidden">

      {/* Cabecera */}
      <div className="flex items-start gap-3 p-4">
        {reading.coverUrl && (
          <img
            src={reading.coverUrl}
            alt="Portada"
            className="w-12 h-18 object-cover rounded-md shadow-sm shrink-0"
            style={{ height: '4.5rem' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-display font-semibold text-[var(--color-ink)] truncate">{reading.title}</h4>
              {reading.author && (
                <p className="text-sm text-[var(--color-ink-light)]">{reading.author}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
                style={{ backgroundColor: STATUS_COLORS[reading.status], color: 'var(--color-ink)' }}
              >
                {STATUS_LABELS[reading.status]}
              </span>
              {canEdit && (
                <div className="flex gap-1">
                  <button onClick={onEdit} className="text-xs text-[var(--color-teal-text)] hover:underline">
                    Editar
                  </button>
                  <button onClick={onDelete} className="text-xs text-red-400 hover:underline">
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estrellas + cringe */}
          <div className="mt-2 flex flex-wrap gap-4">
            {reading.rating && (
              <div className="flex gap-0.5" title={`${reading.rating}/5 estrellas`}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= reading.rating! ? 'text-amber-400' : 'text-[var(--color-accent-light)]'}>
                    ★
                  </span>
                ))}
              </div>
            )}
            {reading.cringeLevel && (
              <div className="flex gap-0.5" title={`Cringe nivel ${reading.cringeLevel}/5`}>
                {[1, 2, 3, 4, 5].map((level) => (
                  <span
                    key={level}
                    style={{ opacity: level <= reading.cringeLevel! ? 1 : 0.2 }}
                  >
                    😣
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cuerpo con los campos cringy */}
      {(reading.cringeReason || reading.redFlags || reading.reflection || reading.recommendedTo || reading.notes) && (
        <div className="border-t border-[var(--color-border)] divide-y divide-[var(--color-border)]">

          {reading.cringeReason && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--color-ink-light)] mb-1">¿Por qué te dio cringe?</p>
              <p className="text-sm text-[var(--color-ink)] italic">"{reading.cringeReason}"</p>
            </div>
          )}

          {reading.redFlags && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--color-ink-light)] mb-1">Red flags 🚩</p>
              <p className="text-sm text-[var(--color-ink)]">{reading.redFlags}</p>
            </div>
          )}

          {reading.reflection && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--color-ink-light)] mb-1">Reflexión</p>
              <p className="text-sm text-[var(--color-ink)]">{reading.reflection}</p>
            </div>
          )}

          {reading.recommendedTo && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--color-ink-light)] mb-1">¿A quién se lo recomendarías?</p>
              <p className="text-sm text-[var(--color-ink)]">{reading.recommendedTo}</p>
            </div>
          )}

          {reading.notes && (
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-[var(--color-ink-light)] mb-1">Notas</p>
              <p className="text-sm text-[var(--color-ink-light)] italic line-clamp-3">"{reading.notes}"</p>
            </div>
          )}
        </div>
      )}

      {/* Fechas */}
      {(reading.startDate || reading.finishDate) && (
        <div className="px-4 pb-3 pt-2 text-xs text-[var(--color-ink-light)] flex gap-4">
          {reading.startDate && (
            <span>Inicio: {new Date(reading.startDate).toLocaleDateString('es-ES')}</span>
          )}
          {reading.finishDate && (
            <span>Fin: {new Date(reading.finishDate).toLocaleDateString('es-ES')}</span>
          )}
        </div>
      )}
    </div>
  )
}
