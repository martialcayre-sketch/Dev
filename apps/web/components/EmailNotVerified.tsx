'use client';
export default function EmailNotVerified({ onResend }: { onResend: () => Promise<void> }) {
  return (
    <div className="border rounded p-3 bg-amber-50 text-amber-800">
  <p className="text-sm">Votre email n&apos;est pas vérifié. Vérifiez votre boîte mail.</p>
      <button onClick={onResend} className="mt-2 px-3 py-1 rounded bg-amber-700 text-white text-sm">
  Renvoyer l&apos;email
      </button>
    </div>
  );
}
