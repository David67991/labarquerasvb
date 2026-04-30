const http = require("http");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = __dirname;

function loadLocalEnv() {
  const envPath = path.join(ROOT_DIR, ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      return;
    }

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) {
      return;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (!key || process.env[key] !== undefined) {
      return;
    }

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = (process.env.OPENAI_API_KEY || "").trim();
const OPENAI_MODEL = (process.env.OPENAI_MODEL || "gpt-4.1-mini").trim();
const USE_OPENAI = String(process.env.USE_OPENAI || "false").toLowerCase() === "true";
const USE_GROQ = String(process.env.USE_GROQ || "true").toLowerCase() === "true";
const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GROQ_MODEL = (process.env.GROQ_MODEL || "llama-3.3-70b-versatile").trim();
const MAX_BODY_SIZE = 1024 * 1024;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject"
};

function sendJson(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function normalize(text) {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const stopWords = new Set([
  "de",
  "la",
  "el",
  "los",
  "las",
  "en",
  "y",
  "o",
  "a",
  "al",
  "del",
  "un",
  "una",
  "por",
  "para",
  "con",
  "que",
  "se",
  "su",
  "sus",
  "es",
  "son",
  "como",
  "cual",
  "cuales",
  "donde",
  "cuando",
  "me",
  "mi",
  "tu",
  "tus"
]);

const TOKEN_CANONICAL_MAP = {
  incial: "inicial",
  inicila: "inicial",
  inical: "inicial",
  invercion: "inversion",
  invesion: "inversion",
  divimatca: "divimatica",
  divimaticaa: "divimatica",
  penson: "pension",
  pencion: "pension",
  matriculas: "matricula",
  pensiones: "pension",
  costos: "costo",
  cuotas: "cuota",
  mensualidad: "mensual",
  admisiones: "admision",
  vacantes: "vacante"
};

const TOKEN_SYNONYM_MAP = {
  inversion: ["costo", "precio", "pension", "mensual", "importe", "cuota"],
  costo: ["inversion", "precio", "pension", "importe", "mensual"],
  precio: ["costo", "inversion", "pension"],
  pension: ["inversion", "mensual", "cuota", "importe"],
  mensual: ["mes", "mensualidad", "pension", "cuota", "inversion"],
  cuota: ["mensual", "pension", "inversion"],
  matricula: ["inscripcion", "pago"],
  inicial: ["costoi", "nivel"],
  primaria: ["costop", "nivel"],
  secundaria: ["costos1", "costos2", "nivel"],
  convenio: ["pnp", "descuento"],
  pnp: ["convenio", "descuento"]
};

function canonicalizeToken(token) {
  if (!token) return "";
  return TOKEN_CANONICAL_MAP[token] || token;
}

function singularizeToken(token) {
  if (!token || token.length < 5) return token;
  if (token.endsWith("es") && token.length > 6) {
    return token.slice(0, -2);
  }
  if (token.endsWith("s")) {
    return token.slice(0, -1);
  }
  return token;
}

function tokenize(text) {
  return normalize(text)
    .split(" ")
    .map((token) => canonicalizeToken(singularizeToken(token)))
    .filter((token) => token && (token.length > 2 || /^[0-9]+$/.test(token)) && !stopWords.has(token));
}

function expandQuestionTokens(baseTokens) {
  const expanded = new Set();

  baseTokens.forEach((token) => {
    const canonical = canonicalizeToken(token);
    expanded.add(canonical);
    const aliases = TOKEN_SYNONYM_MAP[canonical] || [];
    aliases.forEach((alias) => {
      expanded.add(canonicalizeToken(alias));
    });
  });

  return [...expanded];
}

function tokensFromQuestion(question) {
  const baseTokens = tokenize(question);
  if (!baseTokens.length) return [];
  return expandQuestionTokens(baseTokens);
}

function containsAnyToken(tokens, terms) {
  if (!Array.isArray(tokens) || !tokens.length) return false;
  return terms.some((term) => tokens.includes(term));
}

const NOISY_MENU_TERMS = [
  "inicio",
  "quienes somos",
  "mision y vision",
  "propuesta educativa",
  "niveles educativos",
  "vida estudiantil",
  "actividades",
  "eventos",
  "admision",
  "admisiones",
  "noticias",
  "contactenos",
  "sieweb",
  "reservar vacante",
  "buscar palabra",
  "cancelar precarga",
  "escribenos",
  "coro misericordiano",
  "divimatica",
  "banda",
  "cadetes",
  "olimpiadas"
];

function isLikelyNavigationNoise(text) {
  const raw = String(text || "");
  const normalized = normalize(raw);
  if (!normalized) return true;

  let termHits = 0;
  NOISY_MENU_TERMS.forEach((term) => {
    if (normalized.includes(term)) {
      termHits += 1;
    }
  });

  const tokens = tokenize(raw);
  const uniqueRatio = new Set(tokens).size / Math.max(tokens.length, 1);
  const noisyTokenSet = new Set([
    "inicio",
    "quienes",
    "somos",
    "historia",
    "mision",
    "vision",
    "propuesta",
    "educativa",
    "perfil",
    "estudiante",
    "vida",
    "estudiantil",
    "nivel",
    "inicial",
    "primaria",
    "secundaria",
    "admision",
    "noticia",
    "contacto",
    "contactenos",
    "sieweb",
    "reserva",
    "vacante",
    "escribenos",
    "cancelar",
    "precarga",
    "divimatica",
    "coro",
    "banda",
    "cadete",
    "olimpiada",
    "taller",
    "departamento",
    "sacramento"
  ]);

  let noisyTokenHits = 0;
  tokens.forEach((token) => {
    if (noisyTokenSet.has(token)) {
      noisyTokenHits += 1;
    }
  });

  const looksMenuList = termHits >= 3 && tokens.length >= 14;
  const tooRepetitive = tokens.length >= 24 && uniqueRatio < 0.4;
  const noSentencePunctuation = !/[.!?]/.test(raw) && tokens.length >= 12;
  const tokenDominatedByNav = tokens.length >= 12 && noisyTokenHits >= Math.ceil(tokens.length * 0.45);
  const mostlyNavWords =
    /(inicio|quienes|somos|propuesta|educativa|vida|estudiantil|admision|noticias|contactenos)/.test(normalized) &&
    !/(S\/|matricula|pension|convenio|descuento|importe)/i.test(raw);

  return looksMenuList || tooRepetitive || tokenDominatedByNav || (mostlyNavWords && noSentencePunctuation);
}

function repairMojibake(text) {
  const raw = String(text || "");
  if (!/[ÃÂâ€]/.test(raw)) {
    return raw;
  }

  try {
    const repaired = Buffer.from(raw, "latin1").toString("utf8");
    const repairedClean = normalize(repaired);
    const rawClean = normalize(raw);
    if (repairedClean.length < rawClean.length * 0.7) {
      return raw;
    }
    return repaired;
  } catch (_error) {
    return raw;
  }
}

function stripBoilerplateHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<header[\s\S]*?<\/header>/gi, " ")
    .replace(/<nav[\s\S]*?<\/nav>/gi, " ")
    .replace(/<footer[\s\S]*?<\/footer>/gi, " ")
    .replace(/<aside[\s\S]*?<\/aside>/gi, " ");
}

function decodeEntities(html) {
  if (!html) return "";
  return html
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)));
}

function htmlToText(html) {
  if (!html) return "";

  let text = stripBoilerplateHtml(html);
  text = text.replace(/<!--[\s\S]*?-->/g, " ");
  text = text.replace(/<script[\s\S]*?<\/script>/gi, " ");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, " ");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<\/(p|div|section|article|header|footer|li|tr|h1|h2|h3|h4|h5|h6)>/gi, "\n");
  text = text.replace(/<\/(td|th)>/gi, " | ");
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);
  text = repairMojibake(text);
  text = text.replace(/\r/g, "\n");
  text = text.replace(/\n{2,}/g, "\n");
  text = text.replace(/[ \t]+/g, " ");
  return text.trim();
}

function splitIntoChunks(text, maxLen = 850) {
  const parts = (text || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const chunks = [];
  let current = "";

  parts.forEach((part) => {
    if (!current) {
      current = part;
      return;
    }

    if ((current + " " + part).length <= maxLen) {
      current += " " + part;
    } else {
      chunks.push(current);
      current = part;
    }
  });

  if (current) {
    chunks.push(current);
  }

  return chunks.filter((chunk) => chunk.length >= 50);
}

function walkHtmlFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach((entry) => {
    if (entry.name.startsWith(".")) return;
    if (entry.name === "node_modules") return;

    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtmlFiles(fullPath, files);
      return;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      files.push(fullPath);
    }
  });
  return files;
}

let SITE_PATH_TOKEN_SET = new Set();

function buildCorpus() {
  const htmlFiles = walkHtmlFiles(ROOT_DIR);
  const corpus = [];
  SITE_PATH_TOKEN_SET = new Set();

  htmlFiles.forEach((filePath) => {
    const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
    const sourceTokens = tokenize(relPath.replace(/[/.]/g, " "));
    sourceTokens.forEach((token) => {
      SITE_PATH_TOKEN_SET.add(token);
    });

    const html = fs.readFileSync(filePath, "utf8");
    const text = htmlToText(html);
    const chunks = splitIntoChunks(text);
    chunks.forEach((chunk) => {
      corpus.push({
        source: relPath,
        text: chunk,
        normalized: normalize(chunk),
        tokenSet: new Set(tokenize(chunk)),
        isNoisy: isLikelyNavigationNoise(chunk)
      });
    });
  });

  return corpus;
}

let WEB_CORPUS = buildCorpus();

function scoreChunk(chunk, queryTokens, normalizedQuestion) {
  let overlap = 0;
  queryTokens.forEach((token) => {
    if (chunk.tokenSet.has(token)) overlap += 1;
  });

  if (!overlap) return 0;

  const coverage = overlap / queryTokens.length;
  const density = overlap / Math.max(chunk.tokenSet.size, queryTokens.length);
  const phraseBonus = normalizedQuestion && chunk.normalized.includes(normalizedQuestion) ? 0.08 : 0;
  const source = (chunk.source || "").toLowerCase();
  let sourceBonus = 0;

  if (queryTokens.includes("inicial") && /(costoi|inicial)/.test(source)) sourceBonus += 0.12;
  if (queryTokens.includes("primaria") && /(costop|primaria)/.test(source)) sourceBonus += 0.12;
  if (queryTokens.includes("secundaria") && /(costos1|costos2|secundaria)/.test(source)) sourceBonus += 0.12;
  if (queryTokens.includes("reserva") && /reserva/.test(source)) sourceBonus += 0.08;
  if (
    containsAnyToken(queryTokens, ["pension", "matricula", "inversion", "costo", "convenio", "descuento"]) &&
    /(costoi|costop|costos1|costos2)/.test(source)
  ) {
    sourceBonus += 0.1;
  }

  queryTokens.forEach((token) => {
    if (token.length >= 4 && source.includes(token)) {
      sourceBonus += 0.16;
    }
  });
  if (sourceBonus > 0.34) sourceBonus = 0.34;

  const noisePenalty = chunk.isNoisy ? 0.45 : 0;
  const lengthPenalty = chunk.text && chunk.text.length > 1200 ? 0.05 : 0;

  return coverage * 0.7 + density * 0.3 + phraseBonus + sourceBonus - noisePenalty - lengthPenalty;
}

function retrieveContext(question, limit = 7) {
  const queryTokens = tokensFromQuestion(question);
  const normalizedQuestion = normalize(question);

  if (!queryTokens.length) {
    return [];
  }

  return WEB_CORPUS
    .map((chunk) => ({
      ...chunk,
      score: scoreChunk(chunk, queryTokens, normalizedQuestion)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.isNoisy !== b.isNoisy) return Number(a.isNoisy) - Number(b.isNoisy);
      return 0;
    })
    .slice(0, limit);
}

function isBalancedParentheses(text) {
  let balance = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] === "(") balance += 1;
    if (text[i] === ")") balance -= 1;
    if (balance < 0) return false;
  }
  return balance === 0;
}

function solveMathQuestion(rawQuestion) {
  const original = (rawQuestion || "").trim();
  if (!original) return { handled: false };

  const q = original
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const hasNumber = /[0-9]/.test(q);
  const hasOperatorSymbol = /[\+\-\*\/xX()]/.test(original);
  const hasMathWords = /(cuanto es|cuanto da|calcula|resuelve|resultado|suma|resta|multiplica|divide|dividido|mas|menos|entre)/.test(q);
  const hasPorExpression = /[0-9][0-9\s.,()]*\spor\s[0-9][0-9\s.,()]*/.test(q);
  const likelyMath = hasNumber && (hasOperatorSymbol || hasMathWords || hasPorExpression);

  if (!likelyMath) return { handled: false };

  const expr = q
    .replace(/[¿?=]/g, " ")
    .replace(/cuanto es|cuanto da|cuanto|calcula|resuelve|resultado|por favor|hola|oye|dime|me dices|cual es|cual|que es/g, " ")
    .replace(/\bdividido\s+entre\b/g, "/")
    .replace(/\bdividido\s+por\b/g, "/")
    .replace(/\bmas\b/g, "+")
    .replace(/\bmenos\b/g, "-")
    .replace(/\bentre\b/g, "/")
    .replace(/\bpor\b/g, "*")
    .replace(/x/g, "*")
    .replace(/,/g, ".")
    .replace(/[^0-9+\-*/().\s]/g, " ")
    .replace(/\s+/g, "");

  if (!expr || !/[0-9]/.test(expr) || !/[+\-*/]/.test(expr)) {
    return {
      handled: true,
      answer: "Puedo resolver operaciones. Escribe la expresion como `8+5`, `12/3` o `7*4`."
    };
  }

  if (/[^0-9+\-*/().]/.test(expr) || !isBalancedParentheses(expr)) {
    return {
      handled: true,
      answer: "No pude interpretar la operacion. Intenta con un formato como `15-7` o `(8+2)*3`."
    };
  }

  if (/^[+\-*/.]/.test(expr) || /[+\-*/.]$/.test(expr) || /[+\-*/.]{2,}/.test(expr)) {
    return {
      handled: true,
      answer: "La operacion parece incompleta. Intenta escribirla otra vez, por ejemplo `1+1`."
    };
  }

  try {
    const result = Function('"use strict"; return (' + expr + ");")();
    if (typeof result === "number" && Number.isFinite(result)) {
      const rounded = Math.round(result * 1000000) / 1000000;
      return { handled: true, answer: "El resultado es " + rounded + "." };
    }
  } catch (_error) {
    return {
      handled: true,
      answer: "No pude resolver esa operacion. Prueba con un formato simple como `24/6`."
    };
  }

  return {
    handled: true,
    answer: "No pude resolver esa operacion. Prueba con un formato simple como `24/6`."
  };
}

function answerDateTimeQuestion(question) {
  const normalizedQuestion = normalize(question);
  const now = new Date();
  const hasExplicitWeekday = /lunes|martes|miercoles|jueves|viernes|sabado|domingo/.test(normalizedQuestion);
  const asksSimpleRelativeDay =
    (/\b(que|cual)\s+dia\s+(es|sera|fue)\b/.test(normalizedQuestion) ||
      /\b(que|cual)\s+dia\b/.test(normalizedQuestion) ||
      /\bdia\s+de\s+la\s+semana\b/.test(normalizedQuestion)) &&
    !hasExplicitWeekday;

  const relativeRefMatch = normalizedQuestion.match(
    /\b(antes de ayer|anteayer|pasado manana|pasadomanana|manana|ayer|hoy)\b/
  );

  if (asksSimpleRelativeDay && relativeRefMatch) {
    const ref = normalizeDayReference(relativeRefMatch[1] || "");
    const offset = DAY_REF_OFFSETS[ref];
    if (offset !== undefined) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() + offset);
      const dayName = targetDate.toLocaleDateString("es-PE", { weekday: "long" });
      const fullDate = targetDate.toLocaleDateString("es-PE", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
      const labelMap = {
        hoy: "Hoy",
        manana: "Manana",
        "pasado manana": "Pasado manana",
        ayer: "Ayer",
        "antes de ayer": "Antes de ayer"
      };
      const label = labelMap[ref] || "Ese dia";
      return label + " es " + dayName + ", " + fullDate + ".";
    }
  }

  const asksDate =
    /(que fecha|fecha de hoy|hoy que fecha|dia de hoy|fecha actual|en que fecha estamos|que dia es hoy|hoy que dia es|que dia estamos hoy|que dia estamos|dia actual|fecha de ahora)/.test(
      normalizedQuestion
    ) ||
    /\b(cual|que)\s+es\s+la\s+fecha\b/.test(normalizedQuestion) ||
    /\b(cual|que)\s+dia\s+de\s+la\s+semana\s+es\s+hoy\b/.test(normalizedQuestion);

  if (asksDate) {
    const todayText = now.toLocaleDateString("es-PE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    return "Hoy es " + todayText + ".";
  }

  const asksTime =
    /(que hora|hora actual|hora es|hora de ahora|que hora tenemos|en que hora estamos|hora exacta|hora peru)/.test(
      normalizedQuestion
    ) || /\b(cual|que)\s+es\s+la\s+hora\b/.test(normalizedQuestion);

  if (asksTime) {
    const timeText = now.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    return "La hora actual es " + timeText + ".";
  }

  return null;
}

const WEEK_DAYS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
  "domingo"
];

const DAY_REF_OFFSETS = {
  hoy: 0,
  ayer: -1,
  manana: 1,
  "pasado manana": 2,
  pasadomanana: 2,
  "antes de ayer": -2,
  anteayer: -2
};

function normalizeDayReference(value) {
  const ref = normalize(value);
  if (ref === "pasadomanana") return "pasado manana";
  if (ref === "anteayer") return "antes de ayer";
  return ref;
}

function parseRelativeDayClues(question) {
  const normalizedQuestion = normalize(question);
  const regex =
    /\b(antes de ayer|anteayer|pasado manana|pasadomanana|manana|ayer|hoy)\b(?:\s+(?:es|fue|sera|seria))?\s+\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/g;
  const clues = [];
  let match = regex.exec(normalizedQuestion);

  while (match) {
    const ref = normalizeDayReference(match[1] || "");
    const day = normalize(match[2] || "");
    const offset = DAY_REF_OFFSETS[ref];
    const dayIndex = WEEK_DAYS.indexOf(day);
    if (offset !== undefined && dayIndex !== -1) {
      const todayIndex = (dayIndex - offset + 700) % 7;
      clues.push({
        ref,
        day,
        todayIndex
      });
    }
    match = regex.exec(normalizedQuestion);
  }

  return clues;
}

function answerRelativeDayQuestion(question) {
  const normalizedQuestion = normalize(question);
  const looksLikeRelativeDayQuestion =
    /(si\s+)?(hoy|ayer|manana|pasado manana|pasadomanana|antes de ayer|anteayer)/.test(
      normalizedQuestion
    ) && /lunes|martes|miercoles|jueves|viernes|sabado|domingo/.test(normalizedQuestion);

  if (!looksLikeRelativeDayQuestion) {
    return null;
  }

  const clues = parseRelativeDayClues(question);
  if (!clues.length) {
    return null;
  }

  const todayIndexes = [...new Set(clues.map((item) => item.todayIndex))];
  if (todayIndexes.length > 1) {
    return (
      "La premisa es inconsistente: las condiciones indican dias distintos para hoy. " +
      "Revisa los datos y te ayudo a resolverlo."
    );
  }

  const todayDay = WEEK_DAYS[todayIndexes[0]];
  return "Con esa premisa, hoy es " + todayDay + ".";
}

const FAMILY_RELATION_ALIASES = {
  padre: "father",
  papa: "father",
  madre: "mother",
  mama: "mother",
  hermano: "brother",
  hermana: "sister",
  hijo: "son",
  hija: "daughter",
  abuelo: "grandfather",
  abuela: "grandmother",
  tio: "uncle",
  tia: "aunt",
  sobrino: "nephew",
  sobrina: "niece",
  nieto: "grandson",
  nieta: "granddaughter"
};

const FAMILY_RELATION_REGEX =
  /\b(padre|papa|madre|mama|hermano|hermana|hijo|hija|abuelo|abuela|tio|tia|sobrino|sobrina|nieto|nieta)\b/g;

function looksLikeFamilyQuestion(question) {
  const normalizedQuestion = normalize(question);
  return (
    /papa|padre|mama|madre|hermano|hermana|hijo|hija|abuelo|abuela|tio|tia|sobrino|sobrina|nieto|nieta/.test(
      normalizedQuestion
    ) && /(mi|de mi|para mi|que seria|quien seria|que es para mi)/.test(normalizedQuestion)
  );
}

function extractFamilyRelationChain(question) {
  const normalizedQuestion = normalize(question);
  const matches = normalizedQuestion.match(FAMILY_RELATION_REGEX) || [];
  return matches
    .map((term) => FAMILY_RELATION_ALIASES[term] || "")
    .filter(Boolean)
    .reverse();
}

function resolveFamilyRelation(chain) {
  if (!Array.isArray(chain) || !chain.length) return "";

  const direct = {
    father: "padre",
    mother: "madre",
    brother: "hermano",
    sister: "hermana",
    son: "hijo",
    daughter: "hija",
    grandfather: "abuelo",
    grandmother: "abuela",
    uncle: "tio",
    aunt: "tia",
    nephew: "sobrino",
    niece: "sobrina",
    grandson: "nieto",
    granddaughter: "nieta"
  };

  if (chain.length === 1) {
    return direct[chain[0]] || "";
  }

  const twoStep = {
    "mother>father": "abuelo",
    "father>father": "abuelo",
    "mother>mother": "abuela",
    "father>mother": "abuela",
    "mother>brother": "tio",
    "mother>sister": "tia",
    "father>brother": "tio",
    "father>sister": "tia",
    "mother>son": "hermano",
    "father>son": "hermano",
    "mother>daughter": "hermana",
    "father>daughter": "hermana",
    "brother>son": "sobrino",
    "brother>daughter": "sobrina",
    "sister>son": "sobrino",
    "sister>daughter": "sobrina",
    "son>son": "nieto",
    "son>daughter": "nieta",
    "daughter>son": "nieto",
    "daughter>daughter": "nieta"
  };

  const key2 = chain[0] + ">" + chain[1];
  if (twoStep[key2]) {
    return twoStep[key2];
  }

  if (chain.length >= 3) {
    const key3 = chain[0] + ">" + chain[1] + ">" + chain[2];
    const threeStep = {
      "mother>father>father": "bisabuelo",
      "mother>father>mother": "bisabuela",
      "mother>mother>father": "bisabuelo",
      "mother>mother>mother": "bisabuela",
      "father>father>father": "bisabuelo",
      "father>father>mother": "bisabuela",
      "father>mother>father": "bisabuelo",
      "father>mother>mother": "bisabuela",
      "mother>brother>son": "primo",
      "mother>brother>daughter": "prima",
      "mother>sister>son": "primo",
      "mother>sister>daughter": "prima",
      "father>brother>son": "primo",
      "father>brother>daughter": "prima",
      "father>sister>son": "primo",
      "father>sister>daughter": "prima"
    };
    if (threeStep[key3]) {
      return threeStep[key3];
    }
  }

  return "";
}

function answerFamilyRelationshipQuestion(question) {
  if (!looksLikeFamilyQuestion(question)) {
    return null;
  }

  const chain = extractFamilyRelationChain(question);
  if (!chain.length) {
    return null;
  }

  const relation = resolveFamilyRelation(chain);
  if (!relation) {
    return "Puedo resolver parentescos directos. Prueba con una frase simple como: `el hermano de mi mama que es para mi`.";
  }

  return "Por parentesco, eso corresponde a tu " + relation + ".";
}

function isReasoningOrRelationalQuestion(question) {
  const normalizedQuestion = normalize(question);
  if (
    /si\s+.*(ayer|hoy|manana|pasado manana|pasadomanana).*(que\s+dia|dia\s+es\s+hoy)/.test(normalizedQuestion)
  ) {
    return true;
  }
  if (looksLikeFamilyQuestion(question)) {
    return true;
  }
  return /que seria para mi|que es para mi|quien seria para mi/.test(normalizedQuestion);
}

const WEATHER_CODE_LABELS = {
  0: "despejado",
  1: "mayormente despejado",
  2: "parcialmente nublado",
  3: "nublado",
  45: "niebla",
  48: "niebla con escarcha",
  51: "llovizna ligera",
  53: "llovizna moderada",
  55: "llovizna intensa",
  56: "llovizna helada ligera",
  57: "llovizna helada intensa",
  61: "lluvia ligera",
  63: "lluvia moderada",
  65: "lluvia intensa",
  66: "lluvia helada ligera",
  67: "lluvia helada intensa",
  71: "nieve ligera",
  73: "nieve moderada",
  75: "nieve intensa",
  77: "granizo fino",
  80: "chubascos ligeros",
  81: "chubascos moderados",
  82: "chubascos violentos",
  85: "chubascos de nieve ligeros",
  86: "chubascos de nieve intensos",
  95: "tormenta",
  96: "tormenta con granizo ligero",
  99: "tormenta con granizo intenso"
};

const RAIN_WEATHER_CODES = new Set([
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99
]);

function isWeatherQuestion(question) {
  const normalizedQuestion = normalize(question);
  return /(llovera|lluvia|clima|tiempo|pronostico|temperatura|tormenta|viento|humedad|nevando|nieve)/.test(
    normalizedQuestion
  );
}

function dayOffsetFromWeatherQuestion(question) {
  const normalizedQuestion = normalize(question);
  if (/pasado manana|pasadomanana/.test(normalizedQuestion)) return 2;
  if (/manana/.test(normalizedQuestion)) return 1;
  return 0;
}

function cleanWeatherLocationName(raw) {
  return String(raw || "")
    .replace(/\b(hoy|manana|pasado manana|pasadomanana|en|de|el|la|las|los|pronostico|clima|tiempo|llovera|lluvia|temperatura)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractWeatherLocation(question) {
  const normalizedQuestion = normalize(question);
  const match = normalizedQuestion.match(/\ben\s+([a-z\s]{2,40})/i);
  if (!match || !match[1]) {
    return null;
  }
  const cleaned = cleanWeatherLocationName(match[1]);
  if (!cleaned || cleaned.length < 2) {
    return null;
  }
  return cleaned;
}

function weatherCodeLabel(code) {
  return WEATHER_CODE_LABELS[code] || "condicion variable";
}

function formatWeatherDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr || "";
  const date = new Date(dateStr + "T00:00:00");
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("es-PE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

async function geocodeLocationOpenMeteo(locationName) {
  if (!locationName) return null;
  const url =
    "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(locationName) +
    "&count=5&language=es&format=json";
  const data = await fetchJsonWithTimeout(url, 8000);
  const results = data && Array.isArray(data.results) ? data.results : [];
  if (!results.length) {
    return null;
  }
  return results[0];
}

async function fetchDailyForecastOpenMeteo(latitude, longitude) {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(latitude) +
    "&longitude=" +
    encodeURIComponent(longitude) +
    "&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&timezone=auto&forecast_days=7";
  return fetchJsonWithTimeout(url, 9000);
}

function isRainLikely(weatherCode, precipitationProbability, precipitationSum) {
  if (RAIN_WEATHER_CODES.has(Number(weatherCode))) return true;
  if (Number(precipitationProbability || 0) >= 45) return true;
  if (Number(precipitationSum || 0) >= 0.8) return true;
  return false;
}

async function answerWeatherQuestion(question) {
  if (!isWeatherQuestion(question)) {
    return null;
  }

  const dayOffset = dayOffsetFromWeatherQuestion(question);
  const explicitLocation = extractWeatherLocation(question);
  const locationQuery = explicitLocation ? explicitLocation : "Huánuco Peru";

  let geo = await geocodeLocationOpenMeteo(locationQuery);
  if (!geo && explicitLocation) {
    geo = await geocodeLocationOpenMeteo("Huánuco Peru");
  }
  if (!geo) {
    return "No pude identificar la ubicacion para el pronostico. Intenta con una ciudad, por ejemplo: `manana llovera en Lima?`";
  }

  const forecast = await fetchDailyForecastOpenMeteo(geo.latitude, geo.longitude);
  const daily = forecast && forecast.daily ? forecast.daily : null;
  if (!daily || !Array.isArray(daily.time) || !daily.time.length) {
    return "No pude obtener el pronostico del tiempo en este momento.";
  }

  const idx = Math.min(dayOffset, daily.time.length - 1);
  const dateRaw = daily.time[idx];
  const dateText = formatWeatherDate(dateRaw);
  const weatherCode = Number((daily.weathercode || [])[idx]);
  const tMax = Number((daily.temperature_2m_max || [])[idx]);
  const tMin = Number((daily.temperature_2m_min || [])[idx]);
  const rainProb = Number((daily.precipitation_probability_max || [])[idx] || 0);
  const rainMm = Number((daily.precipitation_sum || [])[idx] || 0);
  const rainLikely = isRainLikely(weatherCode, rainProb, rainMm);

  const whenText = dayOffset === 0 ? "hoy" : dayOffset === 1 ? "manana" : "pasado manana";
  const placeParts = [geo.name, geo.admin1, geo.country].filter(Boolean);
  const placeText = placeParts.join(", ");
  const rainMessage = rainLikely
    ? "si hay probabilidad de lluvia"
    : "no se espera lluvia importante";

  return (
    "Para " +
    placeText +
    ", " +
    whenText +
    " (" +
    dateText +
    ") " +
    rainMessage +
    ". " +
    "Probabilidad maxima: " +
    rainProb +
    "%, precipitacion estimada: " +
    rainMm.toFixed(1) +
    " mm. " +
    "Temperatura: minima " +
    tMin.toFixed(1) +
    "°C y maxima " +
    tMax.toFixed(1) +
    "°C. " +
    "Condicion: " +
    weatherCodeLabel(weatherCode) +
    ".\n\nFuente: Open-Meteo"
  );
}

function extractOutputText(payload) {
  if (payload && typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  if (payload && Array.isArray(payload.output)) {
    const parts = [];
    payload.output.forEach((item) => {
      if (!item || !Array.isArray(item.content)) return;
      item.content.forEach((contentItem) => {
        if (!contentItem) return;
        if ((contentItem.type === "output_text" || contentItem.type === "text") && typeof contentItem.text === "string") {
          parts.push(contentItem.text);
        }
      });
    });
    return parts.join("\n").trim();
  }

  return "";
}

async function callOpenAI(question, contextChunks, pagePath) {
  const now = new Date();
  const todayText = now.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const timeText = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const contextText =
    contextChunks.length > 0
      ? contextChunks
          .map((chunk, index) => {
            return "[" + (index + 1) + " | " + chunk.source + "] " + chunk.text;
          })
          .join("\n\n")
      : "(Sin contexto relevante del sitio)";

  const systemPrompt = [
    "Eres un asistente ultra preciso para un sitio educativo.",
    "Reglas obligatorias:",
    "1) Responde siempre en espanol claro y correcto.",
    "2) Si la pregunta trata del colegio o su web, usa primero CONTEXTO_WEB y no inventes datos.",
    "3) Si la pregunta no es del colegio, responde con conocimiento general correcto.",
    "4) Nunca respondas con texto incoherente o fuera de tema.",
    "5) Si no hay datos del colegio en contexto, dilo explicitamente.",
    "6) Si usas datos del colegio, termina con una linea: Fuentes: archivo1, archivo2"
  ].join("\n");

  const userPrompt = [
    "FECHA_ACTUAL: " + todayText,
    "HORA_ACTUAL: " + timeText,
    "PAGINA_ACTUAL: " + (pagePath || "/"),
    "",
    "PREGUNTA:",
    question,
    "",
    "CONTEXTO_WEB:",
    contextText
  ].join("\n");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.1,
      max_output_tokens: 520,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: userPrompt }]
        }
      ]
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error("OpenAI API error: " + response.status + " " + detail);
  }

  const payload = await response.json();
  const answer = extractOutputText(payload);
  if (!answer) {
    throw new Error("No se pudo extraer respuesta del modelo.");
  }

  return answer;
}

async function callGroq(question, contextChunks, pagePath) {
  const now = new Date();
  const todayText = now.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  const timeText = now.toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  const contextText =
    contextChunks.length > 0
      ? contextChunks
          .map((chunk, index) => "[" + (index + 1) + " | " + chunk.source + "] " + chunk.text)
          .join("\n\n")
      : "(Sin contexto relevante del sitio)";

  const schoolQuestion = isSchoolQuestion(question);
  const systemPrompt = [
    "Eres un asistente inteligente en espanol para un sitio educativo.",
    "Reglas obligatorias:",
    "1) Responde con precision y en lenguaje claro.",
    "2) Evita inventar datos: si no sabes algo, dilo brevemente.",
    "3) Si la pregunta es del colegio, usa CONTEXTO_WEB como fuente principal.",
    "4) Si la pregunta es general, responde con conocimiento general y razonamiento correcto.",
    "5) Para preguntas capciosas o logicas, razona internamente y entrega solo la respuesta final.",
    schoolQuestion
      ? "6) Al usar datos del colegio, cierra con: Fuentes: archivo1, archivo2"
      : "6) No inventes fuentes ni datos."
  ].join("\n");

  const userPrompt = [
    "FECHA_ACTUAL: " + todayText,
    "HORA_ACTUAL: " + timeText,
    "PAGINA_ACTUAL: " + (pagePath || "/"),
    "",
    "PREGUNTA:",
    question,
    "",
    "CONTEXTO_WEB:",
    contextText
  ].join("\n");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + GROQ_API_KEY
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.1,
        max_tokens: 520,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const answer =
      payload &&
      Array.isArray(payload.choices) &&
      payload.choices[0] &&
      payload.choices[0].message &&
      typeof payload.choices[0].message.content === "string"
        ? payload.choices[0].message.content.trim()
        : "";
    if (!answer) {
      return null;
    }

    return answer;
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function splitSentencesForAnswer(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .split(/[.!?]+\s+|\n+/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 26 && sentence.length <= 420);
}

function tokenOverlapCount(text, queryTokens) {
  const tokenSet = new Set(tokenize(text));
  let overlap = 0;
  queryTokens.forEach((token) => {
    if (tokenSet.has(token)) overlap += 1;
  });
  return overlap;
}

function pickRelevantSnippet(chunk, queryTokens) {
  const sourceText = repairMojibake(chunk && chunk.text ? chunk.text : "");
  if (!sourceText) return "";

  const sentences = splitSentencesForAnswer(sourceText);
  const ranked = sentences
    .map((sentence) => ({
      sentence,
      overlap: tokenOverlapCount(sentence, queryTokens),
      noisy: isLikelyNavigationNoise(sentence)
    }))
    .filter((item) => item.overlap > 0 && !item.noisy)
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return b.sentence.length - a.sentence.length;
    })
    .slice(0, 2);

  if (ranked.length) {
    return ranked.map((item) => item.sentence).join(". ");
  }

  if (!chunk.isNoisy && tokenOverlapCount(sourceText, queryTokens) > 0) {
    return sourceText.replace(/\s+/g, " ").trim().slice(0, 420);
  }

  return "";
}

function fallbackAnswer(question, contextChunks) {
  if (!Array.isArray(contextChunks) || !contextChunks.length) return null;

  const school = isSchoolQuestion(question);
  const normalizedQuestion = normalize(question);
  const likelyTemporalGenericQuestion =
    !school &&
    !getMeaningfulQuestionTokens(question).length &&
    /(dia|fecha|hora|hoy|ayer|manana|pasado manana|pasadomanana|anteayer|antes de ayer)/.test(
      normalizedQuestion
    );
  if (likelyTemporalGenericQuestion) {
    return null;
  }

  const queryTokens = tokensFromQuestion(question);
  const financialSchoolQuestion =
    school &&
    /inversion|pension|matricula|costo|precio|importe|mensual|cuota|convenio|descuento|reserva/.test(
      normalizedQuestion
    );

  let candidates = contextChunks.slice();
  const cleanCandidates = candidates.filter((chunk) => !chunk.isNoisy);
  if (cleanCandidates.length) {
    candidates = cleanCandidates;
  }

  if (financialSchoolQuestion) {
    const preferred = candidates.filter((chunk) => {
      const source = (chunk.source || "").toLowerCase();
      const text = chunk.text || "";
      return (
        /(costoi|costop|costos1|costos2)/.test(source) ||
        /(S\/|Hermano|Matr|Pensi|Descuento|Convenio|Importe|cronograma|reserva)/i.test(text)
      );
    });
    if (preferred.length) {
      candidates = preferred;
    }
  }

  const minScore = school ? 0.08 : 0.2;
  let top = candidates.filter((chunk) => chunk.score >= minScore);
  if (!top.length && school) {
    top = candidates.filter((chunk) => chunk.score >= 0.045).slice(0, 3);
  } else {
    top = top.slice(0, school ? 3 : 2);
  }

  if (!top.length) return null;

  const lines = [];
  const sources = [];

  top.forEach((chunk) => {
    const snippet = pickRelevantSnippet(chunk, queryTokens);
    if (!snippet) return;
    lines.push(lines.length + 1 + ". " + snippet);
    if (!sources.includes(chunk.source)) {
      sources.push(chunk.source);
    }
  });

  if (!lines.length) return null;
  return lines.join("\n") + "\n\nFuentes: " + sources.join(", ");
}

function userFriendlyOpenAIError(errorMessage) {
  const msg = String(errorMessage || "");
  if (/insufficient_quota|429/i.test(msg)) {
    return (
      "El motor inteligente esta activo, pero la cuenta de IA no tiene cuota disponible en este momento (error 429). " +
      "Recarga saldo o cambia la API key para respuestas generales."
    );
  }
  if (/invalid_api_key|401/i.test(msg)) {
    return "La API key de OpenAI es invalida o no autorizada. Revisa OPENAI_API_KEY en tu .env.";
  }
  if (/model/i.test(msg) && /not found|does not exist|404/i.test(msg)) {
    return "El modelo configurado no esta disponible. Revisa OPENAI_MODEL en tu .env.";
  }
  return "El motor inteligente tuvo un error temporal. Intenta nuevamente en unos minutos.";
}

const SCHOOL_TERMS = [
  "colegio",
  "misericordia",
  "san vicente",
  "barquera",
  "svb",
  "admision",
  "admisiones",
  "admicion",
  "vacante",
  "vacantes",
  "matricula",
  "matriculas",
  "pension",
  "inversion",
  "costo",
  "costos",
  "inicial",
  "incial",
  "costoi",
  "primaria",
  "costop",
  "secundaria",
  "costos1",
  "costos2",
  "reserva",
  "quienes",
  "somos",
  "propuesta",
  "educativa",
  "vida",
  "estudiantil",
  "divimatica",
  "leno",
  "banda",
  "cadetes",
  "coro",
  "olimpiadas",
  "sacramentos",
  "taller",
  "departamento",
  "noticias",
  "historia",
  "mision",
  "vision",
  "contacto",
  "huanuco"
];

function isSchoolQuestion(question) {
  const normalizedQuestion = normalize(question);
  const queryTokens = tokensFromQuestion(question);
  if (containsAnyToken(queryTokens, SCHOOL_TERMS)) {
    return true;
  }
  if (queryTokens.some((token) => SITE_PATH_TOKEN_SET.has(token))) {
    return true;
  }

  return /(colegio|san vicente|barquera|misericordia|admision|vacante|matricula|pension|inversion|costo|inicial|primaria|secundaria|reserva|contacto|huanuco|quienes somos|propuesta educativa|vida estudiantil|noticias|contactenos|divimatica|leno|banda|cadetes|coro|olimpiadas|sacramentos|taller|departamento)/.test(
    normalizedQuestion
  );
}

const TUITION_DATA = {
  inicial: {
    label: "Nivel Inicial",
    source: "pages/costoi.html",
    reservaMensual: "S/ 20.00",
    rows: [
      { hermano: "1er Hermano", matricula: "S/ 500.00", pension: "S/ 500.00", descuento: "S/ 0.00", pensionReserva: "S/ 480.00" },
      { hermano: "2do Hermano", matricula: "S/ 250.00", pension: "S/ 470.00", descuento: "S/ 30.00", pensionReserva: "S/ 450.00" },
      { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 440.00", descuento: "S/ 60.00", pensionReserva: "S/ 420.00" },
      { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 410.00", descuento: "S/ 90.00", pensionReserva: "S/ 390.00" },
      { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 380.00", descuento: "S/ 120.00", pensionReserva: "S/ 360.00" }
    ],
    convenio: { descuento25: "S/ 125.00", pensionConvenio: "S/ 375.00", descuentoAdicional: "S/ 20.00", pensionFinal: "S/ 355.00" }
  },
  primaria: {
    label: "Nivel Primaria",
    source: "pages/costop.html",
    reservaMensual: "S/ 25.00",
    rows: [
      { hermano: "1er Hermano", matricula: "S/ 570.00", pension: "S/ 570.00", descuento: "S/ 0.00", pensionReserva: "S/ 548.00" },
      { hermano: "2do Hermano", matricula: "S/ 285.00", pension: "S/ 540.00", descuento: "S/ 30.00", pensionReserva: "S/ 515.00" },
      { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 510.00", descuento: "S/ 60.00", pensionReserva: "S/ 485.00" },
      { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 480.00", descuento: "S/ 90.00", pensionReserva: "S/ 455.00" },
      { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 450.00", descuento: "S/ 120.00", pensionReserva: "S/ 425.00" }
    ],
    convenio: { descuento25: "S/ 142.50", pensionConvenio: "S/ 428.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 403.00" }
  },
  secundaria13: {
    label: "Secundaria 1ro - 3ro",
    source: "pages/costos1.html",
    reservaMensual: "S/ 25.00",
    rows: [
      { hermano: "1er Hermano", matricula: "S/ 590.00", pension: "S/ 590.00", descuento: "S/ 0.00", pensionReserva: "S/ 565.00" },
      { hermano: "2do Hermano", matricula: "S/ 295.00", pension: "S/ 560.00", descuento: "S/ 30.00", pensionReserva: "S/ 535.00" },
      { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 530.00", descuento: "S/ 60.00", pensionReserva: "S/ 505.00" },
      { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 500.00", descuento: "S/ 90.00", pensionReserva: "S/ 475.00" },
      { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 470.00", descuento: "S/ 120.00", pensionReserva: "S/ 445.00" }
    ],
    convenio: { descuento25: "S/ 147.50", pensionConvenio: "S/ 443.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 418.00" }
  },
  secundaria45: {
    label: "Secundaria 4to - 5to",
    source: "pages/costos2.html",
    reservaMensual: "S/ 25.00",
    rows: [
      { hermano: "1er Hermano", matricula: "S/ 610.00", pension: "S/ 610.00", descuento: "S/ 0.00", pensionReserva: "S/ 585.00" },
      { hermano: "2do Hermano", matricula: "S/ 305.00", pension: "S/ 580.00", descuento: "S/ 30.00", pensionReserva: "S/ 555.00" },
      { hermano: "3er Hermano", matricula: "No paga", pension: "S/ 550.00", descuento: "S/ 60.00", pensionReserva: "S/ 525.00" },
      { hermano: "4to Hermano", matricula: "No paga", pension: "S/ 520.00", descuento: "S/ 90.00", pensionReserva: "S/ 495.00" },
      { hermano: "5to Hermano", matricula: "No paga", pension: "S/ 490.00", descuento: "S/ 120.00", pensionReserva: "S/ 465.00" }
    ],
    convenio: { descuento25: "S/ 152.50", pensionConvenio: "S/ 458.00", descuentoAdicional: "S/ 25.00", pensionFinal: "S/ 433.00" }
  }
};

function detectTuitionLevels(queryTokens, normalizedQuestion) {
  const levels = [];
  const wantsSec = containsAnyToken(queryTokens, ["secundaria", "secundario", "costos1", "costos2"]);
  const asks13 = /secundaria[^0-9]{0,20}(1|2|3)|1\s*[-a]\s*3|1ro|2do|3ro/.test(normalizedQuestion);
  const asks45 = /secundaria[^0-9]{0,20}(4|5)|4\s*[-a]\s*5|4to|5to/.test(normalizedQuestion);

  if (containsAnyToken(queryTokens, ["inicial", "costoi"])) {
    levels.push("inicial");
  }
  if (containsAnyToken(queryTokens, ["primaria", "costop"])) {
    levels.push("primaria");
  }
  if (wantsSec && (asks13 || (!asks13 && !asks45))) {
    levels.push("secundaria13");
  }
  if (wantsSec && (asks45 || (!asks13 && !asks45))) {
    levels.push("secundaria45");
  }
  if (asks13 && !levels.includes("secundaria13")) {
    levels.push("secundaria13");
  }
  if (asks45 && !levels.includes("secundaria45")) {
    levels.push("secundaria45");
  }
  return levels;
}

function formatRowsForResponse(rows, valueKey) {
  return rows.map((row) => row.hermano + ": " + row[valueKey]).join("; ");
}

function answerFromTuitionData(question) {
  const normalizedQuestion = normalize(question);
  const queryTokens = tokensFromQuestion(question);

  const isTuitionQuestion = containsAnyToken(queryTokens, [
    "inversion",
    "costo",
    "costos",
    "precio",
    "pension",
    "mensual",
    "mensualidad",
    "importe",
    "pago",
    "cuota",
    "matricula",
    "inscripcion",
    "convenio",
    "pnp",
    "descuento"
  ]);
  if (!isTuitionQuestion) return null;

  const levels = detectTuitionLevels(queryTokens, normalizedQuestion);
  const wantsConvenio = containsAnyToken(queryTokens, ["convenio", "pnp"]);
  const wantsMatricula = containsAnyToken(queryTokens, ["matricula", "inscripcion"]);
  const wantsMensual = containsAnyToken(queryTokens, [
    "mensual",
    "mensualidad",
    "mes",
    "pension",
    "inversion",
    "costo",
    "precio",
    "importe",
    "cuota"
  ]);

  if (!wantsConvenio && !wantsMatricula && !wantsMensual) {
    return null;
  }

  if (!levels.length) {
    return (
      "Puedo responderte costos exactos por nivel. Resumen rapido (1er hermano, pension):\n" +
      "1. Nivel Inicial: S/ 500.00 (con reserva: S/ 480.00)\n" +
      "2. Nivel Primaria: S/ 570.00 (con reserva: S/ 548.00)\n" +
      "3. Secundaria 1ro-3ro: S/ 590.00 (con reserva: S/ 565.00)\n" +
      "4. Secundaria 4to-5to: S/ 610.00 (con reserva: S/ 585.00)\n\n" +
      "Indica el nivel para darte el detalle completo por hermano.\nFuente: pages/costoi.html, pages/costop.html, pages/costos1.html, pages/costos2.html"
    );
  }

  const uniqueLevels = levels.filter((levelKey, index) => levels.indexOf(levelKey) === index && !!TUITION_DATA[levelKey]);
  const sections = uniqueLevels.map((levelKey) => {
    const level = TUITION_DATA[levelKey];
    const lines = [level.label + ":"];

    if (wantsConvenio) {
      lines.push(
        "Convenio PNP 25%: descuento " +
          level.convenio.descuento25 +
          ", pension por convenio " +
          level.convenio.pensionConvenio +
          ", descuento adicional " +
          level.convenio.descuentoAdicional +
          ", pension final " +
          level.convenio.pensionFinal +
          "."
      );
    } else if (wantsMatricula) {
      lines.push("Matricula general por hermano: " + formatRowsForResponse(level.rows, "matricula") + ".");
    } else {
      lines.push("Pension mensual establecida: " + formatRowsForResponse(level.rows, "pension") + ".");
      lines.push(
        "Con reserva en plazo y pago segun cronograma: " + formatRowsForResponse(level.rows, "pensionReserva") + "."
      );
      lines.push("Descuento mensual por reserva: " + level.reservaMensual + ".");
    }

    lines.push("Fuente: " + level.source);
    return lines.join("\n");
  });

  return sections.join("\n\n");
}

function formatDateFromWikidata(raw) {
  if (!raw || typeof raw !== "string") return "";
  const clean = raw.replace(/^\+/, "").split("T")[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean)) return "";
  const date = new Date(clean + "T00:00:00Z");
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

async function fetchJsonWithTimeout(url, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function pickCountryFromQuestion(question) {
  const normalizedQuestion = normalize(question);
  const match = normalizedQuestion.match(
    /presidente(?:\s+actual)?(?:\s+de(?:l|la)?\s+)([a-z\s]+)/i
  );
  if (!match || !match[1]) return null;
  const cleaned = match[1]
    .replace(/\b(hoy|ahora|actual|actualmente)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return cleaned;
}

function chooseCurrentHeadClaim(claims) {
  if (!Array.isArray(claims) || !claims.length) return null;
  const valid = claims.filter((claim) => {
    const mainsnak = claim && claim.mainsnak;
    return (
      mainsnak &&
      mainsnak.snaktype === "value" &&
      mainsnak.datavalue &&
      mainsnak.datavalue.value &&
      mainsnak.datavalue.value.id
    );
  });
  if (!valid.length) return null;

  const noEnd = valid.filter((claim) => {
    const qualifiers = claim.qualifiers || {};
    return !Array.isArray(qualifiers.P582) || qualifiers.P582.length === 0;
  });
  const base = noEnd.length ? noEnd : valid;
  const preferred = base.filter((claim) => claim.rank === "preferred");
  return preferred[0] || base[0] || null;
}

function extractClaimStartDate(claim) {
  const qualifiers = (claim && claim.qualifiers) || {};
  if (!Array.isArray(qualifiers.P580) || !qualifiers.P580.length) {
    return "";
  }
  const timeSnak = qualifiers.P580[0];
  const raw =
    timeSnak &&
    timeSnak.datavalue &&
    timeSnak.datavalue.value &&
    timeSnak.datavalue.value.time
      ? timeSnak.datavalue.value.time
      : "";
  return formatDateFromWikidata(raw);
}

function getEntityLabel(entity, lang = "es") {
  if (!entity || !entity.labels) return "";
  if (entity.labels[lang] && entity.labels[lang].value) {
    return entity.labels[lang].value;
  }
  if (entity.labels.en && entity.labels.en.value) {
    return entity.labels.en.value;
  }
  const first = Object.values(entity.labels)[0];
  return first && first.value ? first.value : "";
}

async function getWikidataEntity(entityId) {
  if (!entityId) return null;
  const url =
    "https://www.wikidata.org/wiki/Special:EntityData/" +
    encodeURIComponent(entityId) +
    ".json";
  const data = await fetchJsonWithTimeout(url, 8000);
  if (!data || !data.entities || !data.entities[entityId]) {
    return null;
  }
  return data.entities[entityId];
}

async function searchCountryEntityId(countryName) {
  if (!countryName) return null;
  const url =
    "https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=es&type=item&limit=8&search=" +
    encodeURIComponent(countryName) +
    "&origin=*";
  const data = await fetchJsonWithTimeout(url, 8000);
  if (!data || !Array.isArray(data.search) || !data.search.length) {
    return null;
  }

  const candidates = data.search;
  const preferred = candidates.find((item) => {
    const desc = normalize(item.description || "");
    return desc.includes("pais") || desc.includes("estado soberano") || desc.includes("country");
  });
  return (preferred || candidates[0]).id || null;
}

async function answerCurrentPresidentQuestion(question) {
  const normalizedQuestion = normalize(question);
  if (!/presidente/.test(normalizedQuestion)) {
    return null;
  }

  let countryName = pickCountryFromQuestion(question);
  if (!countryName && /peru/.test(normalizedQuestion)) {
    countryName = "peru";
  }
  if (!countryName) {
    return null;
  }

  const countryId = await searchCountryEntityId(countryName);
  if (!countryId) {
    return null;
  }

  const countryEntity = await getWikidataEntity(countryId);
  if (!countryEntity || !countryEntity.claims || !countryEntity.claims.P35) {
    return null;
  }

  const claim = chooseCurrentHeadClaim(countryEntity.claims.P35);
  if (!claim) {
    return null;
  }

  const headId = claim.mainsnak.datavalue.value.id;
  const headEntity = await getWikidataEntity(headId);
  const headName = getEntityLabel(headEntity, "es") || getEntityLabel(headEntity, "en");
  const countryLabel = getEntityLabel(countryEntity, "es") || countryName;
  if (!headName) {
    return null;
  }

  const startDate = extractClaimStartDate(claim);
  let answer = "El presidente actual de " + countryLabel + " es " + headName + ".";
  if (startDate) {
    answer += " Ejerce desde " + startDate + ".";
  }
  answer += "\n\nFuente: Wikidata (" + countryId + ", " + headId + ")";
  return answer;
}

function extractDuckDuckGoRelatedText(relatedTopics) {
  if (!Array.isArray(relatedTopics)) {
    return "";
  }
  for (const item of relatedTopics) {
    if (!item) continue;
    if (typeof item.Text === "string" && item.Text.trim()) {
      return item.Text.trim();
    }
    if (Array.isArray(item.Topics)) {
      const nested = extractDuckDuckGoRelatedText(item.Topics);
      if (nested) return nested;
    }
  }
  return "";
}

const AMBIGUOUS_SEARCH_TOKENS = new Set([
  "hoy",
  "dia",
  "fecha",
  "hora",
  "actual",
  "actualmente",
  "ayer",
  "manana",
  "pasado",
  "semana",
  "mes",
  "ano"
]);

function getMeaningfulQuestionTokens(question) {
  return tokenize(question)
    .filter((token) => token.length >= 3)
    .filter((token) => !AMBIGUOUS_SEARCH_TOKENS.has(token));
}

function isTopicallyAligned(question, candidateText) {
  const qTokens = tokenize(question).filter((token) => token.length >= 3);
  const cTokens = new Set(tokenize(candidateText));
  const meaningfulTokens = qTokens.filter((token) => !AMBIGUOUS_SEARCH_TOKENS.has(token));

  if (!qTokens.length || !cTokens.size) {
    return false;
  }

  let shared = 0;
  qTokens.forEach((token) => {
    if (cTokens.has(token)) {
      shared += 1;
    }
  });

  const coverage = shared / qTokens.length;
  if (qTokens.length <= 2) {
    if (!meaningfulTokens.length) return false;
    return shared >= Math.max(1, Math.min(2, meaningfulTokens.length));
  }
  if (!meaningfulTokens.length && coverage < 0.9) {
    return false;
  }
  return shared >= 2 || coverage >= 0.45;
}

async function answerFromDuckDuckGo(question) {
  if (!getMeaningfulQuestionTokens(question).length) {
    return null;
  }

  const url =
    "https://api.duckduckgo.com/?q=" +
    encodeURIComponent(question) +
    "&format=json&no_html=1&skip_disambig=1";
  const data = await fetchJsonWithTimeout(url, 8000);
  if (!data) {
    return null;
  }

  const raw =
    (typeof data.Answer === "string" && data.Answer.trim()) ||
    (typeof data.AbstractText === "string" && data.AbstractText.trim()) ||
    (typeof data.Definition === "string" && data.Definition.trim()) ||
    extractDuckDuckGoRelatedText(data.RelatedTopics);

  if (!raw) {
    return null;
  }

  const cleaned = String(raw).replace(/\s+/g, " ").trim();
  if (cleaned.length < 12) {
    return null;
  }

  const heading = (data.Heading || "").trim();
  if (!isTopicallyAligned(question, heading + " " + cleaned)) {
    return null;
  }

  const short =
    cleaned.length > 520 ? cleaned.slice(0, 520).trim() + "..." : cleaned;
  const sourceUrl =
    (typeof data.AbstractURL === "string" && data.AbstractURL.trim()) ||
    "https://duckduckgo.com/?q=" + encodeURIComponent(question);
  return short + "\n\nFuente: DuckDuckGo (" + sourceUrl + ")";
}

async function answerFromWikipedia(question) {
  if (!getMeaningfulQuestionTokens(question).length) {
    return null;
  }

  const searchUrl =
    "https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=" +
    encodeURIComponent(question) +
    "&utf8=1&format=json&origin=*";
  const searchData = await fetchJsonWithTimeout(searchUrl, 8000);
  const results =
    searchData &&
    searchData.query &&
    Array.isArray(searchData.query.search)
      ? searchData.query.search
      : [];
  if (!results.length) {
    return null;
  }

  const title = results[0].title;
  const summaryUrl =
    "https://es.wikipedia.org/api/rest_v1/page/summary/" +
    encodeURIComponent(title);
  const summaryData = await fetchJsonWithTimeout(summaryUrl, 8000);
  const extract = summaryData && summaryData.extract ? String(summaryData.extract).trim() : "";
  if (!extract) {
    return null;
  }

  const shortExtract =
    extract.length > 520 ? extract.slice(0, 520).trim() + "..." : extract;

  if (!isTopicallyAligned(question, title + " " + shortExtract)) {
    return null;
  }

  return shortExtract + "\n\nFuente: Wikipedia (" + title + ")";
}

async function answerWithFreeIntelligence(question, contextChunks) {
  const dateTimeAnswer = answerDateTimeQuestion(question);
  if (dateTimeAnswer) {
    return dateTimeAnswer;
  }

  const weatherAnswer = await answerWeatherQuestion(question);
  if (weatherAnswer) {
    return weatherAnswer;
  }

  const relativeDayAnswer = answerRelativeDayQuestion(question);
  if (relativeDayAnswer) {
    return relativeDayAnswer;
  }

  const familyAnswer = answerFamilyRelationshipQuestion(question);
  if (familyAnswer) {
    return familyAnswer;
  }

  const reasoningOrRelational = isReasoningOrRelationalQuestion(question);

  const school = isSchoolQuestion(question);
  if (school) {
    const tuitionAnswer = answerFromTuitionData(question);
    if (tuitionAnswer) {
      return tuitionAnswer;
    }

    const schoolAnswer = fallbackAnswer(question, contextChunks);
    if (schoolAnswer) {
      return schoolAnswer;
    }

    return (
      "No encontre esa informacion exacta en el contenido principal del sitio. " +
      "Prueba indicando nivel o seccion (por ejemplo: Inicial, Primaria, Secundaria, Admision, Contacto)."
    );
  }

  const presidentAnswer = await answerCurrentPresidentQuestion(question);
  if (presidentAnswer) {
    return presidentAnswer;
  }

  if (!reasoningOrRelational) {
    const duckAnswer = await answerFromDuckDuckGo(question);
    if (duckAnswer) {
      return duckAnswer;
    }

    const wikiAnswer = await answerFromWikipedia(question);
    if (wikiAnswer) {
      return wikiAnswer;
    }
  }

  const contextAnswer = fallbackAnswer(question, contextChunks);
  if (contextAnswer) {
    return contextAnswer;
  }

  if (reasoningOrRelational) {
    return (
      "No pude resolver esa pregunta capciosa con suficiente confianza en modo basico. " +
      "Activa un proveedor IA en la nube (por ejemplo Groq) para razonamiento avanzado."
    );
  }

  return "No pude encontrar una respuesta confiable para esa pregunta en este momento.";
}

function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;

    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > MAX_BODY_SIZE) {
        reject(new Error("Body demasiado grande"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });

    req.on("error", reject);
  });
}

function resolveStaticPath(urlPath) {
  let safePath = decodeURIComponent(urlPath || "/");
  if (safePath === "/") {
    safePath = "/index.html";
  }

  const absolutePath = path.resolve(ROOT_DIR, "." + safePath);
  if (!absolutePath.startsWith(path.resolve(ROOT_DIR))) {
    return null;
  }
  return absolutePath;
}

function serveStatic(req, res, pathname) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  const filePath = resolveStaticPath(pathname);
  if (!filePath) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  let finalPath = filePath;
  if (fs.existsSync(finalPath) && fs.statSync(finalPath).isDirectory()) {
    finalPath = path.join(finalPath, "index.html");
  }

  fs.readFile(finalPath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(finalPath).toLowerCase();
    const mime = MIME_TYPES[ext] || "application/octet-stream";
    res.writeHead(200, {
      "Content-Type": mime,
      "Cache-Control": "no-cache"
    });
    res.end(data);
  });
}

async function handleChatApi(req, res) {
  try {
    const rawBody = await getRequestBody(req);
    const body = rawBody ? JSON.parse(rawBody) : {};
    const question = (body.question || "").trim();
    const pagePath = (body.page || "").trim();

    if (!question) {
      sendJson(res, 400, { error: "Pregunta vacia." });
      return;
    }

    const math = solveMathQuestion(question);
    if (math.handled) {
      sendJson(res, 200, { answer: math.answer, mode: "math" });
      return;
    }

    const dateTime = answerDateTimeQuestion(question);
    if (dateTime) {
      sendJson(res, 200, { answer: dateTime, mode: "datetime" });
      return;
    }

    const schoolIntent = isSchoolQuestion(question);
    const contextChunks = retrieveContext(question, schoolIntent ? 14 : 7);

    const deterministicWeather = await answerWeatherQuestion(question);
    if (deterministicWeather) {
      sendJson(res, 200, { answer: deterministicWeather, mode: "deterministic_weather" });
      return;
    }

    const deterministicRelativeDay = answerRelativeDayQuestion(question);
    if (deterministicRelativeDay) {
      sendJson(res, 200, { answer: deterministicRelativeDay, mode: "deterministic_relative_day" });
      return;
    }

    const deterministicFamily = answerFamilyRelationshipQuestion(question);
    if (deterministicFamily) {
      sendJson(res, 200, { answer: deterministicFamily, mode: "deterministic_family" });
      return;
    }

    if (schoolIntent) {
      const localSchoolAnswer = await answerWithFreeIntelligence(question, contextChunks);
      if (localSchoolAnswer) {
        sendJson(res, 200, { answer: localSchoolAnswer, mode: "school_local" });
        return;
      }
    }

    if (USE_GROQ && GROQ_API_KEY) {
      const groqAnswer = await callGroq(question, contextChunks, pagePath);
      if (groqAnswer) {
        sendJson(res, 200, { answer: groqAnswer, mode: "groq" });
        return;
      }
    }

    if (!USE_OPENAI || !OPENAI_API_KEY) {
      const answer = await answerWithFreeIntelligence(question, contextChunks);
      sendJson(res, 200, { answer, mode: "free_intelligence" });
      return;
    }

    try {
      const answer = await callOpenAI(question, contextChunks, pagePath);
      sendJson(res, 200, { answer, mode: "openai" });
      return;
    } catch (openAiError) {
      const freeAnswer = await answerWithFreeIntelligence(question, contextChunks);
      if (freeAnswer) {
        sendJson(res, 200, {
          answer: freeAnswer,
          mode: "free_intelligence_after_openai_error"
        });
        return;
      }

      const friendly = userFriendlyOpenAIError(openAiError.message);
      sendJson(res, 200, {
        answer: friendly,
        mode: "openai_error"
      });
      return;
    }
  } catch (error) {
    sendJson(res, 500, {
      error: "No se pudo procesar la pregunta.",
      details: error.message
    });
  }
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, "http://localhost:" + PORT);
  const pathname = requestUrl.pathname;

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && pathname === "/api/chat") {
    await handleChatApi(req, res);
    return;
  }

  if (req.method === "POST" && pathname === "/api/reindex") {
    WEB_CORPUS = buildCorpus();
    sendJson(res, 200, { ok: true, chunks: WEB_CORPUS.length });
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res, pathname);
    return;
  }

  res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Method Not Allowed");
});

server.listen(PORT, () => {
  console.log("Servidor chatbot listo en http://localhost:" + PORT);
  console.log("Modo Groq:", USE_GROQ && GROQ_API_KEY ? "ACTIVADO" : "DESACTIVADO");
  if (USE_GROQ) {
    console.log("Modelo Groq:", GROQ_MODEL);
  }
  console.log("Modo OpenAI:", USE_OPENAI ? "ACTIVADO" : "DESACTIVADO");
  if (USE_OPENAI) {
    console.log("Modelo OpenAI:", OPENAI_MODEL);
  }
  console.log("Corpus cargado:", WEB_CORPUS.length, "fragmentos");
  if (USE_GROQ && !GROQ_API_KEY) {
    console.log("Aviso: falta GROQ_API_KEY; se usara fallback gratuito basado en reglas/web.");
  }
  if (!OPENAI_API_KEY || !USE_OPENAI) {
    console.log("Aviso: se usara motor gratuito (Open-Meteo/Wikidata/DuckDuckGo/Wikipedia + contexto local).");
  }
});

