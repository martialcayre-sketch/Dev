/** Central serialization helpers */
export function serializeTimestamp(ts) {
  if (!ts) return null;
  try {
    if (typeof ts.toDate === 'function') return ts.toDate().toISOString();
    if (ts._seconds != null) return new Date(ts._seconds * 1000).toISOString();
  } catch {}
  return ts;
}
export function calculateProgress(responses, questions) {
  if (!Array.isArray(questions) || questions.length === 0) return 0;
  if (!responses || typeof responses !== 'object') return 0;
  let answered = 0;
  for (const key of Object.keys(responses)) {
    const v = responses[key];
    if (v !== null && v !== undefined && v !== '') answered++;
  }
  return Math.round((answered / questions.length) * 100);
}
export function serializeQuestionnaireDoc(doc) {
  const data = doc.data ? doc.data() : doc;
  const id = doc.id || data.id;
  return {
    id,
    ...data,
    assignedAt: serializeTimestamp(data.assignedAt),
    submittedAt: serializeTimestamp(data.submittedAt),
    completedAt: serializeTimestamp(data.completedAt),
    updatedAt: serializeTimestamp(data.updatedAt),
    progress: calculateProgress(data.responses, data.questions),
  };
}
