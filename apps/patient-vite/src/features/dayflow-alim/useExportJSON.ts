import { downloadJSON, safeCopyToClipboard } from '@/lib/safeClipboard';

export type DefaultExportAction = 'copy' | 'download';

export function useExportJSON(defaultAction: DefaultExportAction = 'copy') {
  async function copyJSON(filename: string, payload: any) {
    const ok = await safeCopyToClipboard(JSON.stringify(payload, null, 2));
    if (!ok) downloadJSON(filename, payload);
  }

  function download(filename: string, payload: any) {
    downloadJSON(filename, payload);
  }

  async function runDefault(filename: string, payload: any) {
    if (defaultAction === 'copy') return copyJSON(filename, payload);
    return download(filename, payload);
  }

  return { copyJSON, download, runDefault };
}
