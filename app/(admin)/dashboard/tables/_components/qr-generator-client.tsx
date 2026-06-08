'use client'

import { QRCodeSVG } from 'qrcode.react'
import { Button } from '@/components/ui/button'
import type { PhysicalTable } from '@/types/database'

interface Props {
  tables: PhysicalTable[]
  appUrl: string
}

export function QrGeneratorClient({ tables, appUrl }: Props) {
  function handlePrint() {
    window.print()
  }

  return (
    <>
      <Button
        onClick={handlePrint}
        className="bg-black hover:bg-gray-800 print:hidden"
      >
        Générer les QR codes PDF
      </Button>

      {/* Zone d'impression — masquée à l'écran, visible à l'impression */}
      <div id="qr-print-area" className="hidden print:block">
        {tables.map(table => (
          <div
            key={table.id}
            className="qr-page flex flex-col items-center justify-center"
            style={{ width: '210mm', height: '297mm', pageBreakAfter: 'always' }}
          >
            <QRCodeSVG
              value={`${appUrl}/t/${table.id}`}
              size={280}
              level="H"
              includeMargin
            />
            <p style={{ fontSize: 28, fontWeight: 700, marginTop: 24, fontFamily: 'sans-serif' }}>
              {table.label}
            </p>
            <p style={{ fontSize: 18, marginTop: 8, fontFamily: 'sans-serif', color: '#555' }}>
              Scannez-moi
            </p>
          </div>
        ))}
      </div>

      <style>{`
        @media print {
          body > * { display: none !important; }
          #qr-print-area { display: block !important; }
          @page { margin: 0; size: A4 portrait; }
        }
      `}</style>
    </>
  )
}
