import { describe, expect, it } from "vitest";
import { computeSlotsFromCalendar, extractUserCalendar } from "./slots";
import type {
  KlipperCalendarAttendance,
  KlipperCalendarScheduleEvent,
  KlipperWeeklySchedule,
} from "@/types/klipper";

const TZ = "America/Santiago";

// 2026-08-31 es lunes.
const MONDAY = "2026-08-31";

const OPEN_MONDAY: KlipperWeeklySchedule = {
  monday: { start_time: "09:00", end_time: "12:00", is_working_day: true },
  sunday: { start_time: "00:00", end_time: "00:00", is_working_day: false },
};

describe("extractUserCalendar", () => {
  it("normaliza la forma envuelta en data", () => {
    const result = extractUserCalendar({
      success: true,
      data: { schedules: [{ id: 1 } as KlipperCalendarScheduleEvent], attendances: [] },
    });
    expect(result.schedules).toHaveLength(1);
  });

  it("normaliza la forma plana (sin data)", () => {
    const result = extractUserCalendar({
      schedules: [{ id: 1 } as KlipperCalendarScheduleEvent],
      attendances: [{ id: 2 } as KlipperCalendarAttendance],
    });
    expect(result.schedules).toHaveLength(1);
    expect(result.attendances).toHaveLength(1);
  });

  it("normaliza un array directo de schedules", () => {
    const result = extractUserCalendar([{ id: 1 } as KlipperCalendarScheduleEvent]);
    expect(result.schedules).toHaveLength(1);
    expect(result.attendances).toEqual([]);
  });

  it("devuelve vacío para null/undefined sin lanzar", () => {
    expect(extractUserCalendar(null)).toEqual({ schedules: [], attendances: [] });
    expect(extractUserCalendar(undefined)).toEqual({ schedules: [], attendances: [] });
  });
});

describe("computeSlotsFromCalendar", () => {
  it("genera slots espaciados por la duración dentro de la ventana de la sucursal (sin citas)", () => {
    const slots = computeSlotsFromCalendar({
      date: MONDAY,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY,
      calendar: { schedules: [], attendances: [] },
      durationMinutes: 60,
    });
    expect(slots).toEqual([
      ["09:00", "10:00"],
      ["10:00", "11:00"],
      ["11:00", "12:00"],
    ]);
  });

  it("is_day_off del profesional cancela el día completo", () => {
    const slots = computeSlotsFromCalendar({
      date: MONDAY,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY,
      calendar: {
        schedules: [{ id: 1, user_id: 1, date: MONDAY, start_time: "09:00", end_time: "12:00", is_day_off: true }],
        attendances: [],
      },
      durationMinutes: 60,
    });
    expect(slots).toEqual([]);
  });

  it("sucursal cerrada ese día → sin slots", () => {
    const slots = computeSlotsFromCalendar({
      date: "2026-08-30", // domingo
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY,
      calendar: { schedules: [], attendances: [] },
      durationMinutes: 60,
    });
    expect(slots).toEqual([]);
  });

  it("el turno propio del profesional angosta la ventana de la sucursal", () => {
    const slots = computeSlotsFromCalendar({
      date: MONDAY,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY, // 09:00-12:00
      calendar: {
        schedules: [
          { id: 1, user_id: 1, date: MONDAY, start_time: "10:00", end_time: "12:00", is_day_off: false },
        ],
        attendances: [],
      },
      durationMinutes: 60,
    });
    expect(slots).toEqual([
      ["10:00", "11:00"],
      ["11:00", "12:00"],
    ]);
  });

  it("una cita ya tomada resta ese bloque y salta al siguiente hueco libre", () => {
    const slots = computeSlotsFromCalendar({
      date: MONDAY,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY,
      calendar: {
        schedules: [],
        attendances: [
          { id: 1, appointment_at: `${MONDAY}T09:00:00`, attended_by: 1, status: "scheduled" },
        ],
      },
      durationMinutes: 60,
    });
    // 09:00-10:00 ocupado → el siguiente slot de 60min empieza a las 10:00.
    expect(slots).toEqual([
      ["10:00", "11:00"],
      ["11:00", "12:00"],
    ]);
  });

  it("ignora citas de otro profesional o de otro día", () => {
    const slots = computeSlotsFromCalendar({
      date: MONDAY,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: OPEN_MONDAY,
      calendar: {
        schedules: [],
        attendances: [
          { id: 1, appointment_at: `${MONDAY}T09:00:00`, attended_by: 2, status: "scheduled" },
          { id: 2, appointment_at: `2026-09-01T09:00:00`, attended_by: 1, status: "scheduled" },
        ],
      },
      durationMinutes: 60,
    });
    expect(slots).toEqual([
      ["09:00", "10:00"],
      ["10:00", "11:00"],
      ["11:00", "12:00"],
    ]);
  });

  it("no genera slots con duración <= 0", () => {
    expect(
      computeSlotsFromCalendar({
        date: MONDAY,
        timezone: TZ,
        professionalId: 1,
        weeklySchedule: OPEN_MONDAY,
        calendar: { schedules: [], attendances: [] },
        durationMinutes: 0,
      })
    ).toEqual([]);
  });

  it("nunca devuelve un horario ya pasado si la fecha consultada es hoy", () => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    const fullDaySchedule: KlipperWeeklySchedule = {
      monday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      tuesday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      wednesday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      thursday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      friday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      saturday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
      sunday: { start_time: "00:00", end_time: "23:59", is_working_day: true },
    };

    const slots = computeSlotsFromCalendar({
      date: todayIso,
      timezone: TZ,
      professionalId: 1,
      weeklySchedule: fullDaySchedule,
      calendar: { schedules: [], attendances: [] },
      durationMinutes: 30,
    });

    const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: TZ }));
    const nowMinutes = nowInTz.getHours() * 60 + nowInTz.getMinutes();
    for (const [start] of slots) {
      const [h, m] = start.split(":").map(Number);
      expect(h * 60 + m).toBeGreaterThan(nowMinutes - 1);
    }
  });
});
