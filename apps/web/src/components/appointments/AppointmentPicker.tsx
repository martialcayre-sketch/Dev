import clsx from 'clsx';
import {
  addDays,
  eachDayOfInterval,
  eachMinuteOfInterval,
  format,
  setHours,
  setMinutes,
  startOfWeek,
  addMinutes,
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';
import { useMemo, useState } from 'react';

const TIMEZONE = 'Europe/Paris';
const SLOT_DURATION = 30; // minutes
const START_HOUR = 9;
const END_HOUR = 18;

interface AppointmentSlot {
  start: Date;
  end: Date;
}

interface ExistingAppointment {
  start: Date;
  end: Date;
}

interface AppointmentPickerProps {
  existingAppointments?: ExistingAppointment[];
  onNext: (slot: AppointmentSlot) => void;
  className?: string;
}

export function AppointmentPicker({
  existingAppointments = [],
  onNext,
  className,
}: AppointmentPickerProps) {
  // État pour la sélection
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);

  // Obtenir la semaine courante
  const currentWeek = useMemo(() => {
    const today = toZonedTime(new Date(), TIMEZONE);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Commence lundi
    return eachDayOfInterval({
      start: weekStart,
      end: addDays(weekStart, 4), // Lundi au vendredi
    });
  }, []);

  // Générer les créneaux pour un jour
  const generateDaySlots = (date: Date): AppointmentSlot[] => {
    const dayStart = setHours(setMinutes(date, 0), START_HOUR);
    const dayEnd = setHours(setMinutes(date, 0), END_HOUR);

    return eachMinuteOfInterval({ start: dayStart, end: dayEnd }, { step: SLOT_DURATION }).map(
      (slotStart) => ({
        start: slotStart,
        end: addMinutes(slotStart, SLOT_DURATION),
      })
    );
  };

  // Vérifier si un créneau est disponible
  const isSlotAvailable = (slot: AppointmentSlot): boolean => {
    return !existingAppointments.some(
      (existing) =>
        (slot.start >= existing.start && slot.start < existing.end) ||
        (slot.end > existing.start && slot.end <= existing.end) ||
        (slot.start <= existing.start && slot.end >= existing.end)
    );
  };

  // Générer tous les créneaux de la semaine
  const weekSlots = useMemo(
    () =>
      currentWeek.map((day) => ({
        date: day,
        slots: generateDaySlots(day),
      })),
    [currentWeek]
  );

  // Formatter les dates et heures
  const formatTime = (date: Date) => format(toZonedTime(date, TIMEZONE), 'HH:mm');

  const formatDate = (date: Date) =>
    format(toZonedTime(date, TIMEZONE), 'EEEE d MMMM', { locale: fr });

  return (
    <div className={clsx('space-y-6', className)}>
      <div className="grid gap-6 md:grid-cols-5">
        {weekSlots.map(({ date, slots }) => (
          <div key={date.toISOString()} className="space-y-2">
            <h3 className="font-medium text-gray-900 text-center">{formatDate(date)}</h3>
            <div className="space-y-1">
              {slots.map((slot) => {
                const isAvailable = isSlotAvailable(slot);
                const isSelected =
                  selectedSlot && slot.start.getTime() === selectedSlot.start.getTime();

                return (
                  <button
                    key={slot.start.toISOString()}
                    onClick={() => {
                      if (isAvailable) {
                        setSelectedSlot(slot);
                      }
                    }}
                    disabled={!isAvailable}
                    className={clsx(
                      'w-full py-2 px-3 text-sm rounded-md transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                      isSelected && 'bg-indigo-600 text-white',
                      !isSelected &&
                        isAvailable &&
                        'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300',
                      !isAvailable &&
                        'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    )}
                  >
                    {formatTime(slot.start)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => selectedSlot && onNext(selectedSlot)}
          disabled={!selectedSlot}
          className={clsx(
            'px-4 py-2 text-sm font-medium rounded-md',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
            selectedSlot
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          Continuer
        </button>
      </div>
    </div>
  );
}
