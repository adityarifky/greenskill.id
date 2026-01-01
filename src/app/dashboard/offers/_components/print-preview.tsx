'use client';

import * as React from 'react';
import type { Offer, Scheme } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface PrintContentProps {
  offer: Partial<Offer>;
  scheme: Partial<Scheme>;
}

export function PrintPreview({ offer, scheme }: PrintContentProps) {
  return (
    <div className="absolute inset-0 text-sm text-gray-800 p-12">
        <div className="space-y-4">
            <div>
                <p>Nomor: {offer?.id ? `OFFER-${offer.id.substring(0,5)}` : 'N/A'}</p>
            </div>
            <div className="text-center">
                <h1 className="text-xl font-bold underline">PENAWARAN PELATIHAN</h1>
            </div>
            <div>
                <p>Kepada Yth.</p>
                <p className="font-semibold">{offer.customerName}</p>
                <p>Di Tempat</p>
            </div>
            <div>
                <p>Dengan hormat,</p>
                <p className="text-justify indent-8">
                    Bersama ini kami dari GreenSkill ID mengajukan penawaran untuk program pelatihan dan sertifikasi, 
                    sesuai dengan permintaan yang Bapak/Ibu ajukan.
                </p>
            </div>
            <div>
                <h2 className="font-semibold mb-2">A. Detail Skema Pelatihan</h2>
                <table className="w-full text-left border-collapse">
                    <tbody>
                        <tr className="border-b">
                            <td className="py-1 pr-4 font-medium align-top w-1/3">Nama Skema</td>
                            <td className="py-1 pr-2 align-top">:</td>
                            <td className="py-1 font-semibold">{scheme.name}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="py-1 pr-4 font-medium align-top">Unit Kompetensi</td>
                            <td className="py-1 pr-2 align-top">:</td>
                            <td className="py-1">
                                <ol className="list-decimal list-inside">
                                    {scheme.units?.map((unit, index) => (
                                        <li key={index}>{unit.unitName} ({unit.unitCode})</li>
                                    ))}
                                </ol>
                            </td>
                        </tr>
                        <tr className="border-b">
                             <td className="py-1 pr-4 font-medium align-top">Biaya</td>
                            <td className="py-1 pr-2 align-top">:</td>
                            <td className="py-1 font-bold text-lg">Rp {Number(scheme.price || 0).toLocaleString('id-ID')},- / orang</td>
                        </tr>
                    </tbody>
                </table>
            </div>

             <div>
                <h2 className="font-semibold mb-2">B. Rincian Tambahan</h2>
                 <p className="text-justify whitespace-pre-wrap">{offer.userRequest}</p>
            </div>

            <div>
                <p className="text-justify indent-8">
                    Demikian surat penawaran ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.
                </p>
            </div>
        </div>
    </div>
  );
}
