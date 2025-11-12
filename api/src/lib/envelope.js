export function makeOk(data, requestId, meta) {
  return { success: true, data, requestId, meta };
}
export function makeError(code, message, requestId, details) {
  return { success: false, error: { code, message, details }, requestId };
}
