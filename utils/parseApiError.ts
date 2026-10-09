/**
 * Utility to parse error responses returned by the drbank-backend API.
 * 
 * Standard backend error response schemas:
 * 1. Direct message (400, 401, 403, 404, 409, 500):
 *    { "message": "Descripción o detalle del error" }
 * 
 * 2. Form/Parameter validation errors (400 / 422):
 *    { "errors": { "nombre_campo": "Mensaje" } } or
 *    { "message": "Los datos proporcionados no son válidos.", "errors": { "nombre_campo": ["Mensaje"] } }
 * 
 * 3. Special status code (e.g., Inactive account / Code 100):
 *    { "code": 100, "message": "Perfil no activado" }
 * 
 * Priority order for evaluation:
 * 1. error?.data?.message
 * 2. error?.data?.error
 * 3. error?.data?.errors (support for { campo: "error" }, { campo: ["error"] }, or array of messages)
 * 4. error?.data?.code (special error code)
 */

export function parseApiError(error: unknown, fallbackMessage?: string): string {
  if (!error) {
    return fallbackMessage || "Ocurrió un error inesperado. Por favor intenta nuevamente.";
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed) return trimmed;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, any>;

    // Handle RTK Query / Axios / Fetch response structure where payload is in `data`
    const data = errObj.data !== undefined ? errObj.data : errObj;

    if (typeof data === "string") {
      const trimmedData = data.trim();
      if (trimmedData) return trimmedData;
    }

    if (data && typeof data === "object") {
      // 1. Direct message: error?.data?.message
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message.trim();
      }

      // 2. Direct error string: error?.data?.error
      if (typeof data.error === "string" && data.error.trim()) {
        return data.error.trim();
      }

      // 3. Validation errors object or array: error?.data?.errors
      if (data.errors) {
        if (typeof data.errors === "string" && data.errors.trim()) {
          return data.errors.trim();
        }

        if (Array.isArray(data.errors)) {
          const messages = data.errors
            .map((item: any) => {
              if (typeof item === "string") return item.trim();
              if (item && typeof item === "object" && typeof item.message === "string") return item.message.trim();
              return "";
            })
            .filter((msg: string) => Boolean(msg));
          if (messages.length > 0) return messages.join("\n");
        } else if (typeof data.errors === "object") {
          const validationMessages: string[] = [];
          Object.values(data.errors).forEach((val) => {
            if (typeof val === "string" && val.trim()) {
              validationMessages.push(val.trim());
            } else if (Array.isArray(val)) {
              val.forEach((item) => {
                if (typeof item === "string" && item.trim()) {
                  validationMessages.push(item.trim());
                } else if (item && typeof item === "object" && typeof item.message === "string" && item.message.trim()) {
                  validationMessages.push(item.message.trim());
                }
              });
            } else if (val && typeof val === "object" && typeof (val as any).message === "string" && (val as any).message.trim()) {
              validationMessages.push((val as any).message.trim());
            }
          });
          if (validationMessages.length > 0) {
            return validationMessages.join("\n");
          }
        }
      }

      // 4. Special error code with message: error?.data?.code
      if (data.code !== undefined && data.code !== null) {
        if (typeof data.message === "string" && data.message.trim()) {
          return data.message.trim();
        }
        return `Error (Código ${data.code})`;
      }
    }

    // 5. RTK Query / fetchBaseQuery network level error
    if (typeof errObj.error === "string" && errObj.error.trim()) {
      if (errObj.status === "FETCH_ERROR") {
        return "Error de conexión. Verifica tu red e inténtalo de nuevo.";
      }
      if (errObj.status === "TIMEOUT_ERROR") {
        return "La solicitud está tardando más de lo esperado. Inténtalo nuevamente.";
      }
      return errObj.error.trim();
    }

    // 6. Standard JS Error object .message
    if (typeof errObj.message === "string" && errObj.message.trim()) {
      return errObj.message.trim();
    }
  }

  return fallbackMessage || "Ocurrió un error al procesar la solicitud.";
}
