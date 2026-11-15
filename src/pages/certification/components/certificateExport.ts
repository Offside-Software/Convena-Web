import type { CertificateOrientation } from '../../../types/certificate.ts'

/**
 * Prints or saves the certificate element as a vector-sharp PDF using a dedicated print frame
 * with exact color preservation (`print-color-adjust: exact`).
 */
export function printCertificateElement(
  elementId: string,
  documentTitle: string,
  orientation: CertificateOrientation = 'landscape'
): void {
  const sourceEl = document.getElementById(elementId)
  if (!sourceEl) {
    window.print()
    return
  }

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    document.body.removeChild(iframe)
    window.print()
    return
  }

  // Copy all active stylesheets from parent document
  const styleNodes = Array.from(
    document.querySelectorAll('style, link[rel="stylesheet"]')
  )
    .map((node) => node.outerHTML)
    .join('\n')

  const pageRule =
    orientation === 'portrait'
      ? '@page { size: A4 portrait; margin: 12mm; }'
      : '@page { size: A4 landscape; margin: 12mm; }'

  doc.open()
  doc.write(`<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>${documentTitle}</title>
  ${styleNodes}
  <style>
    ${pageRule}
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .print-wrapper {
      width: 100%;
      max-width: ${orientation === 'portrait' ? '720px' : '1040px'};
      margin: 0 auto;
    }
  </style>
</head>
<body>
  <div class="print-wrapper">
    ${sourceEl.outerHTML}
  </div>
</body>
</html>`)
  doc.close()

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe)
        }
      }, 1500)
    }
  }, 350)
}
