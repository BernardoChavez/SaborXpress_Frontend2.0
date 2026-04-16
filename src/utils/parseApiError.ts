import axios from 'axios';

/** Errores por campo (clave = nombre del campo en el API, ej. correo, contrasena). */
export type FieldErrors = Record<string, string>;

export interface ParsedApiError {
  /** Mensaje general (resumen o primer error). */
  summary: string;
  /** Un mensaje por campo para mostrar bajo cada input. */
  fields: FieldErrors;
}

/**
 * Interpreta respuestas de Laravel (422 validation, 401, etc.) y Axios.
 */
export function parseApiError(error: unknown): ParsedApiError {
  const empty: ParsedApiError = { summary: 'Ocurrió un error. Intenta de nuevo.', fields: {} };

  if (!axios.isAxiosError(error) || !error.response) {
    if (error instanceof Error) return { summary: error.message, fields: {} };
    return empty;
  }

  const data = error.response.data as {
    message?: string;
    errors?: Record<string, string[] | string>;
  };

  const rawErrors = data?.errors;
  const fields: FieldErrors = {};

  if (rawErrors && typeof rawErrors === 'object') {
    for (const [key, val] of Object.entries(rawErrors)) {
      const msg = Array.isArray(val) ? val[0] : val;
      if (typeof msg === 'string' && msg.trim()) {
        fields[key] = msg.trim();
      }
    }
  }

  const firstFieldMessage = Object.values(fields)[0];
  const summary =
    firstFieldMessage ||
    (typeof data?.message === 'string' ? data.message : '') ||
    `Error ${error.response.status}`;

  return { summary, fields };
}
