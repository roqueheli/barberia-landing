import { describe, expect, it } from "vitest";
import { weeklyScheduleToHorario } from "./schedule";
import type { KlipperWeeklySchedule } from "@/types/klipper";

const open = (start: string, end: string) => ({ start_time: start, end_time: end, is_working_day: true });
const closed = { start_time: "", end_time: "", is_working_day: false };

describe("weeklyScheduleToHorario", () => {
  it("agrupa días contiguos con el mismo horario en un solo rango", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("10:00", "21:00"),
      tuesday: open("10:00", "21:00"),
      wednesday: open("10:00", "21:00"),
      thursday: open("10:00", "21:00"),
      friday: open("10:00", "21:00"),
      saturday: open("10:00", "20:00"),
      sunday: open("10:00", "19:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes a viernes", horas: "10:00 - 21:00" },
      { dias: "Sábado", horas: "10:00 - 20:00" },
      { dias: "Domingo", horas: "10:00 - 19:00" },
    ]);
  });

  it("usa 'y' para exactamente dos días contiguos con el mismo horario", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("09:00", "19:00"),
      tuesday: open("09:00", "19:00"),
      wednesday: open("09:00", "19:00"),
      thursday: open("09:00", "19:00"),
      friday: open("09:00", "19:00"),
      saturday: open("10:00", "14:00"),
      sunday: open("10:00", "14:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes a viernes", horas: "09:00 - 19:00" },
      { dias: "Sábado y domingo", horas: "10:00 - 14:00" },
    ]);
  });

  it("muestra los días cerrados como 'Cerrado', agrupados", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("09:00", "19:00"),
      tuesday: open("09:00", "19:00"),
      wednesday: open("09:00", "19:00"),
      thursday: open("09:00", "19:00"),
      friday: open("09:00", "19:00"),
      saturday: closed,
      sunday: closed,
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes a viernes", horas: "09:00 - 19:00" },
      { dias: "Sábado y domingo", horas: "Cerrado" },
    ]);
  });

  it("recorta segundos en las horas (10:00:00 -> 10:00)", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("10:00:00", "21:00:00"),
      tuesday: open("10:00:00", "21:00:00"),
      wednesday: open("10:00:00", "21:00:00"),
      thursday: open("10:00:00", "21:00:00"),
      friday: open("10:00:00", "21:00:00"),
      saturday: open("10:00:00", "21:00:00"),
      sunday: open("10:00:00", "21:00:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes a domingo", horas: "10:00 - 21:00" },
    ]);
  });

  it("los días ausentes en el schedule se tratan como cerrados", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("10:00", "21:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes", horas: "10:00 - 21:00" },
      { dias: "Martes a domingo", horas: "Cerrado" },
    ]);
  });

  it("recorre siempre en orden lunes->domingo aunque las claves vengan desordenadas", () => {
    const schedule: KlipperWeeklySchedule = {
      sunday: open("10:00", "19:00"),
      monday: open("10:00", "21:00"),
      friday: open("10:00", "21:00"),
      wednesday: open("10:00", "21:00"),
      tuesday: open("10:00", "21:00"),
      thursday: open("10:00", "21:00"),
      saturday: open("10:00", "21:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes a sábado", horas: "10:00 - 21:00" },
      { dias: "Domingo", horas: "10:00 - 19:00" },
    ]);
  });

  it("devuelve [] cuando no hay schedule o viene vacío (para caer al curado)", () => {
    expect(weeklyScheduleToHorario(undefined)).toEqual([]);
    expect(weeklyScheduleToHorario(null)).toEqual([]);
    expect(weeklyScheduleToHorario({})).toEqual([]);
  });

  it("devuelve [] si todos los días están cerrados (no muestra 'toda la semana Cerrado')", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: closed,
      tuesday: closed,
      wednesday: closed,
      thursday: closed,
      friday: closed,
      saturday: closed,
      sunday: closed,
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([]);
  });

  it("trata un día sin start/end como cerrado aunque is_working_day sea true", () => {
    const schedule: KlipperWeeklySchedule = {
      monday: open("10:00", "21:00"),
      tuesday: { start_time: "", end_time: "", is_working_day: true },
      wednesday: open("10:00", "21:00"),
      thursday: open("10:00", "21:00"),
      friday: open("10:00", "21:00"),
      saturday: open("10:00", "21:00"),
      sunday: open("10:00", "21:00"),
    };
    expect(weeklyScheduleToHorario(schedule)).toEqual([
      { dias: "Lunes", horas: "10:00 - 21:00" },
      { dias: "Martes", horas: "Cerrado" },
      { dias: "Miércoles a domingo", horas: "10:00 - 21:00" },
    ]);
  });
});
