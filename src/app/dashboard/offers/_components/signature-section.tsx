'use client';

import Image from 'next/image';

export function SignatureSection() {
  // Date can be made dynamic later if needed
  const signatureDate = new Date('2025-12-22');
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(signatureDate);

  return (
    <div className="absolute bottom-32 right-20 text-center text-sm text-gray-800">
      <p className="mb-2">Yogyakarta, {formattedDate}</p>
      <p className="mb-12">GreenSkill ID</p>
      <div className="relative mx-auto h-28 w-28">
        {/* Stamp */}
        <div className="absolute inset-0 flex items-center justify-center">
            <svg
                className="h-36 w-36 -rotate-[15deg] opacity-40 text-cyan-500"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    id="circlePath"
                    fill="none"
                    strokeWidth="2"
                    d="M 10, 50 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0"
                />
                <text fill="currentColor" fontSize="12" fontWeight="bold">
                <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
                    GREENSKILL ID
                </textPath>
                </text>
                 <path d="M35 55 C 45 40, 55 40, 65 55" stroke="currentColor" strokeWidth="3" fill="none" />
                 <path d="M35 55 Q 50 75, 65 55" stroke="currentColor" strokeWidth="3" fill="none" />
            </svg>
        </div>

        {/* Signature Scribble */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-48 w-48 text-blue-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M 62.9 8.6 C 62.9 8.6 75.3 22.2 76.1 32 C 76.9 41.8 69.3 53.6 57.6 55.4 C 45.9 57.2 38.3 49.3 35.5 40.2 C 32.7 31.1 35.9 19.3 49.2 9.5 C 62.5 -0.3 62.9 8.6 62.9 8.6 Z M 49.2 9.5 C 35.9 19.3 22.9 49.9 22.9 49.9 C 22.9 49.9 33.7 61.2 39.5 64 C 45.3 66.8 55.5 67.8 55.5 67.8 L 51.9 81.5 L 49.2 91.4" />
          </svg>
        </div>
      </div>
      <p className="mt-12 font-bold underline">Ir. Saprian, S.T., M.Sc., M.T., IPM., ASEAN.Eng.</p>
      <p>Direktur</p>
    </div>
  );
}
