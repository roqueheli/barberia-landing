import { describe, expect, it } from "vitest";
import { matchByName, mergeEquipo, mergeServicios, mergeSucursales } from "./organization-content";
import type { Barbero, Servicio, Sucursal } from "@/types";
import type { KlipperProfessionalPublic, MarketingBranch, MarketingService } from "@/types/klipper";

const curatedSucursal: Sucursal = {
  slug: "providencia",
  nombre: "Better Barber Club Providencia",
  comuna: "Providencia",
  direccion: "Dirección curada",
  ciudad: "Santiago",
  region: "Región Metropolitana",
  telefono: "+56 2 2345 6789",
  whatsapp: "56912345678",
  referenciaMetro: "Metro Manuel Montt",
  horario: [{ dias: "Lunes a viernes", horas: "09:30 - 20:30" }],
  rating: 4.9,
  numeroResenas: 412,
  numeroBarberos: 7,
  descripcionCorta: "Casa matriz",
  imagenPortada: "https://picsum.photos/seed/providencia/1600/1000",
  imagenPortadaAlt: "Interior",
  galeria: [],
  geo: { lat: -33.4263, lng: -70.6122 },
  fechaApertura: "2019-03-01",
  urlReserva: "https://wa.me/56912345678",
};

describe("matchByName", () => {
  it("matchea ignorando acentos, mayúsculas y espacios", () => {
    const live = [{ name: "PROVIDENCIA" }];
    expect(matchByName("Better Barber Club Providencia", "providencia", live)).toBe(live[0]);
  });

  it("matchea por fragmento de slug cuando el nombre en vivo es más corto", () => {
    const live = [{ name: "Las Condes" }];
    expect(matchByName("Cualquier Nombre", "las-condes", live)).toBe(live[0]);
  });

  it("devuelve null si no hay coincidencia", () => {
    const live = [{ name: "La Florida" }];
    expect(matchByName("Providencia", "providencia", live)).toBeNull();
  });
});

describe("mergeSucursales", () => {
  it("con live=null devuelve el contenido curado tal cual, enVivo=false", () => {
    const result = mergeSucursales(null, [curatedSucursal]);
    expect(result).toEqual([
      {
        ...curatedSucursal,
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=-33.4263,-70.6122",
        imagenPortadaEnVivo: false,
        enVivo: false,
      },
    ]);
  });

  it("fusiona hechos en vivo con copy curado cuando hay match por nombre", () => {
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: "Av. Providencia 1810, local 4 (real)",
      comuna: null,
      ciudad: null,
      phone: "+56911112222",
      latitude: -33.42,
      longitude: -70.61,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);

    expect(result.enVivo).toBe(true);
    expect(result.slug).toBe("providencia");
    expect(result.nombre).toBe("Providencia");
    expect(result.direccion).toBe("Av. Providencia 1810, local 4 (real)");
    expect(result.telefono).toBe("+56911112222");
    expect(result.whatsapp).toBe("56911112222");
    expect(result.geo).toEqual({ lat: -33.42, lng: -70.61 });
    // sin google_maps_url real, se construye desde el geo en vivo
    expect(result.mapsUrl).toBe("https://www.google.com/maps/search/?api=1&query=-33.42,-70.61");
    // copy curado no reemplazado por Klipper
    expect(result.rating).toBe(4.9);
    expect(result.galeria).toEqual([]);
    expect(result.klipperBranchId).toBe(100);
    // sin photo_url en vivo, la imagen curada se mantiene
    expect(result.imagenPortada).toBe(curatedSucursal.imagenPortada);
    expect(result.imagenPortadaEnVivo).toBe(false);
  });

  it("usa el horario en vivo de Klipper (weekly_schedule) por sobre el curado", () => {
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
      weeklySchedule: {
        monday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
        tuesday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
        wednesday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
        thursday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
        friday: { start_time: "10:00", end_time: "21:00", is_working_day: true },
        saturday: { start_time: "10:00", end_time: "20:00", is_working_day: true },
        sunday: { start_time: "10:00", end_time: "19:00", is_working_day: true },
      },
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);
    expect(result.horario).toEqual([
      { dias: "Lunes a viernes", horas: "10:00 - 21:00" },
      { dias: "Sábado", horas: "10:00 - 20:00" },
      { dias: "Domingo", horas: "10:00 - 19:00" },
    ]);
  });

  it("cae al horario curado si Klipper no trae weekly_schedule", () => {
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);
    expect(result.horario).toEqual(curatedSucursal.horario);
  });

  it("prioriza el google_maps_url real de Klipper por sobre el link construido desde geo", () => {
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: -33.42,
      longitude: -70.61,
      photoUrl: null,
      googleMapsUrl: "https://maps.google.com/?cid=123456",
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);
    expect(result.mapsUrl).toBe("https://maps.google.com/?cid=123456");
  });

  it("usa la foto real de la sucursal cuando Klipper la trae, incluso con match curado", () => {
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: "https://cdn.jsdelivr.net/gh/example/fachada.jpg",
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);

    expect(result.imagenPortada).toBe("https://cdn.jsdelivr.net/gh/example/fachada.jpg");
    expect(result.imagenPortadaEnVivo).toBe(true);
    expect(result.imagenPortadaAlt).toBe("Fachada de Providencia");
  });

  it("una sucursal en vivo sin match local se muestra con fallback simple, sin inventar copy", () => {
    const branch: MarketingBranch = {
      id: 200,
      name: "Sucursal Nueva",
      address: "Dirección real",
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);

    expect(result.enVivo).toBe(true);
    expect(result.slug).toBe("sucursal-nueva-200");
    expect(result.nombre).toBe("Sucursal Nueva");
    expect(result.direccion).toBe("Dirección real");
    expect(result.rating).toBeUndefined();
    expect(result.descripcionCorta).toBeUndefined();
    expect(result.galeria).toEqual([]);
    expect(result.geo).toBeUndefined();
    expect(result.whatsapp).toBeUndefined();
  });

  it("el slug generado para una sucursal sin match no arrastra guiones duplicados", () => {
    const branch: MarketingBranch = {
      id: 300,
      name: "Vicuña Mackenna - La Florida",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const [result] = mergeSucursales([branch], [curatedSucursal]);
    expect(result.slug).toBe("vicuna-mackenna-la-florida-300");
  });

  it("dos sucursales sin match con el mismo nombre nunca generan el mismo slug", () => {
    const branchA: MarketingBranch = {
      id: 501,
      name: "Sucursal Centro",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };
    const branchB = { ...branchA, id: 502 };

    const result = mergeSucursales([branchA, branchB], [curatedSucursal]);
    expect(result.map((r) => r.slug)).toEqual(["sucursal-centro-501", "sucursal-centro-502"]);
  });

  it("una sucursal curada sin match en vivo se descarta", () => {
    const otraSucursal: Sucursal = { ...curatedSucursal, slug: "las-condes", nombre: "Las Condes" };
    const branch: MarketingBranch = {
      id: 100,
      name: "Providencia",
      address: null,
      comuna: null,
      ciudad: null,
      phone: null,
      latitude: null,
      longitude: null,
      photoUrl: null,
      googleMapsUrl: null,
      googlePlaceId: null,
      googleRating: null,
      googleReviewCount: null,
    };

    const result = mergeSucursales([branch], [curatedSucursal, otraSucursal]);

    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("providencia");
  });
});

describe("mergeServicios", () => {
  const curatedServicio: Servicio = {
    slug: "corte-clasico",
    nombre: "Corte clásico",
    categoria: "corte",
    descripcionCorta: "Corte a tijera y máquina",
    descripcionLarga: "Descripción larga",
    precioDesde: 12000,
    moneda: "CLP",
    duracionMinutos: 40,
    imagen: "https://picsum.photos/seed/corte/900/700",
    imagenAlt: "Alt",
    incluye: ["Diagnóstico"],
    sucursalesDisponibles: ["providencia"],
  };

  it("usa precio/duración en vivo cuando hay match, conserva 'incluye' curado", () => {
    const service: MarketingService = {
      id: 1,
      name: "Corte clásico",
      price: 13500,
      duration: 45,
      description: null,
      photoUrl: null,
      priceWithOffer: null,
    };
    const [result] = mergeServicios([service], [curatedServicio]);

    expect(result.enVivo).toBe(true);
    expect(result.precioDesde).toBe(13500);
    expect(result.duracionMinutos).toBe(45);
    expect(result.incluye).toEqual(["Diagnóstico"]);
  });

  it("con live=null degrada al contenido curado", () => {
    expect(mergeServicios(null, [curatedServicio])).toEqual([
      { ...curatedServicio, imagenEnVivo: false, enVivo: false },
    ]);
  });

  it("un servicio en vivo sin match local no inventa 'incluye' ni descripciones, pero sí usa foto/descripción reales", () => {
    const service: MarketingService = {
      id: 2,
      name: "Servicio nuevo",
      price: 5000,
      duration: 20,
      description: "Descripción real de Klipper",
      photoUrl: "https://cdn.jsdelivr.net/gh/example/servicio-nuevo.jpg",
      priceWithOffer: null,
    };
    const [result] = mergeServicios([service], [curatedServicio]);

    expect(result.slug).toBe("servicio-nuevo-2");
    expect(result.incluye).toEqual([]);
    expect(result.descripcionCorta).toBe("Descripción real de Klipper");
    expect(result.imagen).toBe("https://cdn.jsdelivr.net/gh/example/servicio-nuevo.jpg");
    expect(result.imagenEnVivo).toBe(true);
  });
});

describe("mergeEquipo", () => {
  const curatedBarbero: Barbero = {
    slug: "matias-rojas",
    nombre: "Matías Rojas",
    rol: "Fundador y Master Barber",
    sucursalPrincipal: "providencia",
    especialidades: ["Afeitado clásico"],
    anosExperiencia: 14,
    foto: "https://picsum.photos/seed/matias/600/700",
    fotoAlt: "Retrato curado",
  };

  it("fusiona nombre/foto/rol en vivo, conserva especialidades curadas", () => {
    const professional: KlipperProfessionalPublic = {
      id: 1,
      name: "Matías Rojas",
      photo_url: "https://klipper.example/matias.jpg",
      role_name: "owner",
    };
    const [result] = mergeEquipo([professional], [curatedBarbero]);

    expect(result.enVivo).toBe(true);
    expect(result.foto).toBe("https://klipper.example/matias.jpg");
    expect(result.rol).toBe("owner");
    expect(result.especialidades).toEqual(["Afeitado clásico"]);
  });

  it("un profesional en vivo sin match ni foto se muestra igual, sin foto (nunca vacía la grilla)", () => {
    const professional: KlipperProfessionalPublic = { id: 2, name: "Nuevo Barbero", photo_url: null };
    const [result] = mergeEquipo([professional], [curatedBarbero]);

    expect(result.slug).toBe("nuevo-barbero-2");
    expect(result.foto).toBeUndefined();
    expect(result.fotoEnVivo).toBe(false);
    expect(result.rol).toBe("Barbero");
  });

  it("un profesional en vivo sin match pero con foto se muestra con fallback simple", () => {
    const professional: KlipperProfessionalPublic = {
      id: 3,
      name: "Nuevo Barbero",
      photo_url: "https://klipper.example/nuevo.jpg",
    };
    const [result] = mergeEquipo([professional], [curatedBarbero]);

    expect(result.slug).toBe("nuevo-barbero-3");
    expect(result.rol).toBe("Barbero");
    expect(result.especialidades).toEqual([]);
    expect(result.fotoAlt).toBe("Retrato de Nuevo Barbero");
  });
});
