'use client'

import { useMemo, useRef, useState } from 'react'

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

type ExportPdfButtonProps = {
  title: string
  createdAt: string
  resourceType: string
  objectives: string[]
  content: string
}

function createFileName(title: string) {
  const normalized = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized ? `${normalized}.pdf` : 'recurso-generado.pdf'
}

export function ExportPdfButton({
  title,
  createdAt,
  resourceType,
  objectives,
  content,
}: ExportPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const fileName = useMemo(() => createFileName(title), [title])

  const handleExport = async () => {
    if (!exportRef.current || isExporting) {
      return
    }

    try {
      setIsExporting(true)

      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      })

      const imageData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        format: 'a4',
        orientation: 'portrait',
        unit: 'mm',
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 12
      const contentWidth = pageWidth - margin * 2
      const scaledHeight = (canvas.height * contentWidth) / canvas.width

      let remainingHeight = scaledHeight
      let offsetY = 0

      pdf.addImage(imageData, 'PNG', margin, margin, contentWidth, scaledHeight)
      remainingHeight -= pageHeight - margin * 2

      while (remainingHeight > 0) {
        offsetY += pageHeight - margin * 2
        pdf.addPage()
        pdf.addImage(
          imageData,
          'PNG',
          margin,
          margin - offsetY,
          contentWidth,
          scaledHeight
        )
        remainingHeight -= pageHeight - margin * 2
      }

      pdf.save(fileName)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <>
      <button
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover disabled:bg-disabled-bg disabled:text-disabled-text"
        disabled={isExporting}
        onClick={handleExport}
        type="button"
      >
        {isExporting ? 'Exportando...' : 'Exportar PDF'}
      </button>

      <div className="pointer-events-none fixed left-0 top-0 -z-10 opacity-0">
        <div
          ref={exportRef}
          style={{
            width: '794px',
            backgroundColor: '#ffffff',
            color: '#0f172a',
            padding: '48px 40px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: '28px',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {title}
          </h1>

          <section
            style={{
              marginTop: '24px',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              backgroundColor: '#f8fafc',
              padding: '20px',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            <p style={{ margin: 0 }}>
              <span style={{ fontWeight: 600 }}>Fecha:</span> {createdAt}
            </p>
            <p style={{ margin: '8px 0 0' }}>
              <span style={{ fontWeight: 600 }}>Tipo de recurso:</span>{' '}
              {resourceType}
            </p>
            <div style={{ marginTop: '8px' }}>
              <span style={{ fontWeight: 600 }}>Objetivos:</span>
              <ul
                style={{
                  margin: '8px 0 0',
                  paddingLeft: '24px',
                }}
              >
                {objectives.length ? (
                  objectives.map((objective) => (
                    <li key={objective} style={{ marginTop: '4px' }}>
                      {objective}
                    </li>
                  ))
                ) : (
                  <li>Sin objetivos asociados</li>
                )}
              </ul>
            </div>
          </section>

          <section style={{ marginTop: '32px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Contenido generado
            </h2>
            <pre
              style={{
                margin: '16px 0 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '14px',
                lineHeight: 1.75,
              }}
            >
              {content}
            </pre>
          </section>
        </div>
      </div>
    </>
  )
}
