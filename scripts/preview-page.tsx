import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { flushSync } from 'react-dom'
import { createRoot } from 'react-dom/client'

import { CV_ACCEPTANCE_CORPUS_V1 } from '../fixtures/cv/cases'
import { ClearlineCv } from '../registry/clearline/clearline'
import { validateCvDataV1, validateCvFidelityEnvelopeV1 } from '../registry/cv-data/cv-data'
import '../src/styles.css'

declare global {
  interface Window {
    cvUiPreviewState?: 'ready' | 'rejected'
    renderCvUiPdfPages: (pdfBase64: string) => Promise<string[]>
  }
}

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

window.renderCvUiPdfPages = async (pdfBase64) => {
  const bytes = Uint8Array.from(atob(pdfBase64), (character) => character.charCodeAt(0))
  const loadingTask = getDocument({ data: bytes })
  const document = await loadingTask.promise
  const images: string[] = []

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2 })
    const canvas = window.document.createElement('canvas')
    canvas.width = 1191
    canvas.height = 1684
    const canvasContext = canvas.getContext('2d')
    if (!canvasContext) throw new Error('Canvas 2D context is unavailable')
    await page.render({
      canvas,
      canvasContext,
      viewport,
      transform: [canvas.width / viewport.width, 0, 0, canvas.height / viewport.height, 0, 0],
    }).promise
    images.push(canvas.toDataURL('image/png'))
    page.cleanup()
  }

  await loadingTask.destroy()
  return images
}

const caseId = new URLSearchParams(window.location.search).get('case')
const corpusCase = CV_ACCEPTANCE_CORPUS_V1.find(({ id }) => id === caseId)
if (!corpusCase) throw new Error(`Unknown Acceptance Corpus case: ${caseId ?? ''}`)

const structural = validateCvDataV1(corpusCase.data)
const fidelity = structural.success ? validateCvFidelityEnvelopeV1(structural.data) : structural

if (!fidelity.success) {
  window.cvUiPreviewState = 'rejected'
} else {
  const root = document.querySelector('#root')
  if (!root) throw new Error('Preview root is missing')
  flushSync(() => createRoot(root).render(<ClearlineCv data={fidelity.data} />))
  await document.fonts.ready
  window.cvUiPreviewState = 'ready'
}
