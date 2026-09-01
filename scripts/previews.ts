import { execFileSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import viteReact from '@vitejs/plugin-react'
import { getDocument, type PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { type BrowserType, chromium, firefox, webkit } from 'playwright'
import { createServer } from 'vite'

import { CV_ACCEPTANCE_CORPUS_V1 } from '../fixtures/cv/cases.ts'
import { findFileDrift } from './file-drift.ts'
import { checkGeneratedArtifacts, GENERATED_OUTPUT_PATHS, generateArtifacts } from './generate.ts'

type PreviewCommandOptions = {
  readonly mode: 'check' | 'update'
  readonly repositoryRoot: string
  readonly capture: (outputRoot: string) => Promise<void>
  readonly prepare?: (outputRoot: string) => Promise<void> | void
  readonly outputPaths?: readonly string[]
}

const repositoryRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))

export const sanitizePdfMetadata = (pdf: Buffer): Buffer =>
  Buffer.from(
    pdf.toString('latin1').replace(/D:\d{14}[+-]\d{2}'\d{2}'/gu, "D:20000101000000+00'00'"),
    'latin1',
  )

const replaceDirectories = (
  sourceRoot: string,
  targetRoot: string,
  outputPaths: readonly string[],
): void => {
  const backupRoot = mkdtempSync(join(tmpdir(), 'cv-ui-previews-backup-'))
  const replaced: string[] = []
  mkdirSync(targetRoot, { recursive: true })

  try {
    for (const path of outputPaths) {
      const source = join(sourceRoot, path)
      const target = join(targetRoot, path)
      const backup = join(backupRoot, path)
      if (!existsSync(source)) throw new Error(`Missing prepared output: ${path}`)
      if (existsSync(target)) {
        mkdirSync(dirname(backup), { recursive: true })
        renameSync(target, backup)
      }
      renameSync(source, target)
      replaced.push(path)
    }
    rmSync(backupRoot, { recursive: true, force: true })
  } catch (error) {
    for (const path of replaced.reverse())
      rmSync(join(targetRoot, path), { recursive: true, force: true })
    for (const path of outputPaths) {
      const backup = join(backupRoot, path)
      if (existsSync(backup)) renameSync(backup, join(targetRoot, path))
    }
    throw error
  }
}

const createPixelDiffs = async (
  actualRoot: string,
  expectedRoot: string,
  diffRoot: string,
  drift: readonly string[],
): Promise<void> => {
  const images = drift.filter(
    (file) =>
      file.endsWith('.png') &&
      existsSync(join(actualRoot, file)) &&
      existsSync(join(expectedRoot, file)),
  )
  if (images.length === 0) return

  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    for (const file of images) {
      const expected = readFileSync(join(expectedRoot, file)).toString('base64')
      const actual = readFileSync(join(actualRoot, file)).toString('base64')
      const image = await page.evaluate(
        async ([expectedBase64, actualBase64]) => {
          const load = (base64: string): Promise<HTMLImageElement> =>
            new Promise((resolveImage, rejectImage) => {
              const value = new Image()
              value.addEventListener('load', () => resolveImage(value))
              value.addEventListener('error', rejectImage)
              value.src = `data:image/png;base64,${base64}`
            })
          const [expectedImage, actualImage] = await Promise.all([
            load(expectedBase64),
            load(actualBase64),
          ])
          const canvas = document.createElement('canvas')
          canvas.width = Math.max(expectedImage.width, actualImage.width)
          canvas.height = Math.max(expectedImage.height, actualImage.height)
          const context = canvas.getContext('2d')
          if (!context) throw new Error('Pixel diff canvas is unavailable')
          context.drawImage(expectedImage, 0, 0)
          const expectedPixels = context.getImageData(0, 0, canvas.width, canvas.height)
          context.clearRect(0, 0, canvas.width, canvas.height)
          context.drawImage(actualImage, 0, 0)
          const actualPixels = context.getImageData(0, 0, canvas.width, canvas.height)
          const diff = context.createImageData(canvas.width, canvas.height)
          for (let index = 0; index < diff.data.length; index += 4) {
            const changed = [0, 1, 2, 3].some(
              (offset) => expectedPixels.data[index + offset] !== actualPixels.data[index + offset],
            )
            if (changed) {
              diff.data[index] = 255
              diff.data[index + 3] = 255
            }
          }
          context.putImageData(diff, 0, 0)
          return canvas.toDataURL('image/png')
        },
        [expected, actual] as const,
      )
      const destination = join(diffRoot, file)
      mkdirSync(dirname(destination), { recursive: true })
      writeFileSync(destination, Buffer.from(image.slice(image.indexOf(',') + 1), 'base64'))
    }
  } finally {
    await browser.close()
  }
}

const writeFailureDiagnostics = async (
  stagingRoot: string,
  repositoryRoot: string,
  diagnosticsRoot: string,
  error: unknown,
): Promise<void> => {
  const actualRoot = join(stagingRoot, 'previews')
  const expectedRoot = join(repositoryRoot, 'public/previews')
  const actualOutput = join(diagnosticsRoot, 'actual')
  const expectedOutput = join(diagnosticsRoot, 'expected')
  mkdirSync(diagnosticsRoot, { recursive: true })
  if (existsSync(actualRoot)) cpSync(actualRoot, actualOutput, { recursive: true })
  if (existsSync(expectedRoot)) cpSync(expectedRoot, expectedOutput, { recursive: true })

  const drift = findFileDrift(expectedRoot, actualRoot)
  const errorText = error instanceof Error ? (error.stack ?? error.message) : String(error)
  let diffError: string | undefined
  try {
    await createPixelDiffs(actualRoot, expectedRoot, join(diagnosticsRoot, 'diff'), drift)
  } catch (pixelError) {
    diffError = pixelError instanceof Error ? pixelError.message : String(pixelError)
  }
  writeFileSync(
    join(diagnosticsRoot, 'report.json'),
    `${JSON.stringify({ status: 'failed', error: errorText, drift, diffError }, null, 2)}\n`,
  )
  writeFileSync(
    join(diagnosticsRoot, 'capture.log'),
    `${errorText}${diffError ? `\nPixel diff failed: ${diffError}` : ''}\n`,
  )
}

export const runPreviewCommand = async ({
  mode,
  repositoryRoot,
  capture,
  prepare,
  outputPaths = ['previews'],
}: PreviewCommandOptions): Promise<void> => {
  const stagingRoot = mkdtempSync(join(tmpdir(), 'cv-ui-previews-'))

  try {
    await capture(stagingRoot)
    await prepare?.(stagingRoot)
    const publicRoot = join(repositoryRoot, 'public')

    if (mode === 'check') {
      const drift = outputPaths.flatMap((path) =>
        findFileDrift(join(stagingRoot, path), join(publicRoot, path)).map(
          (file) => `${path}/${file}`,
        ),
      )
      if (drift.length > 0) throw new Error(`Preview output drift:\n${drift.join('\n')}`)
      return
    }

    replaceDirectories(stagingRoot, publicRoot, outputPaths)
  } catch (error) {
    const diagnostics = process.env.CV_UI_PREVIEW_DIAGNOSTICS
    if (diagnostics) {
      try {
        await writeFailureDiagnostics(
          stagingRoot,
          repositoryRoot,
          resolve(repositoryRoot, diagnostics),
          error,
        )
      } catch (diagnosticsError) {
        console.error(`Preview diagnostics failed: ${String(diagnosticsError)}`)
      }
    }
    throw error
  } finally {
    rmSync(stagingRoot, { recursive: true, force: true })
  }
}

const compactText = (value: string): string => value.normalize('NFC').replace(/[•\s]/gu, '')

type MarkerSample = {
  readonly marker: string
  readonly text: string
  readonly orphanText: string | null
  readonly maySplit: boolean
}

type PdfPageInspection = {
  readonly text: string
  readonly links: readonly string[]
}

const inspectPdfPage = async (
  document: PDFDocumentProxy,
  pageNumber: number,
): Promise<PdfPageInspection> => {
  const page = await document.getPage(pageNumber)
  const viewport = page.getViewport({ scale: 1 })
  if (Math.abs(viewport.width - 594.96) > 0.01 || Math.abs(viewport.height - 841.92) > 0.01)
    throw new Error(`PDF page ${pageNumber} is not A4: ${viewport.width}x${viewport.height}`)

  const content = await page.getTextContent()
  for (const item of content.items) {
    if (!('str' in item) || compactText(item.str).length === 0) continue
    const left = item.transform[4] ?? 0
    const baseline = item.transform[5] ?? 0
    const right = left + item.width
    const top = baseline + item.height
    const minimumInset = 28.35
    if (
      left < minimumInset - 0.75 ||
      right > viewport.width - minimumInset + 0.75 ||
      baseline < minimumInset - 0.75 ||
      top > viewport.height - minimumInset + 0.75
    )
      throw new Error(`PDF text reaches a page edge on page ${pageNumber}: ${item.str}`)
  }

  const text = content.items.flatMap((item) => ('str' in item ? [item.str] : [])).join('')
  const annotations = await page.getAnnotations({ intent: 'print' })
  const links = annotations.flatMap((annotation) => {
    const url = Reflect.get(annotation, 'url') ?? Reflect.get(annotation, 'unsafeUrl')
    return typeof url === 'string' ? [url] : []
  })
  page.cleanup()
  return { text, links }
}

const inspectPdfText = (pdfText: string, expectedText: string): void => {
  const actual = compactText(pdfText)
  const expected = compactText(expectedText)
  const mismatchIndex = [...expected].findIndex(
    (character, index) => [...actual][index] !== character,
  )
  if (mismatchIndex !== -1 || actual.length !== expected.length)
    throw new Error(
      `PDF text does not match DOM reading order at ${mismatchIndex}: ${[...actual][mismatchIndex] ?? '<end>'} != ${[...expected][mismatchIndex] ?? '<end>'}`,
    )
}

const inspectPdfMarkers = (
  pageTexts: readonly string[],
  markerSamples: readonly MarkerSample[],
  expectedMarkers: readonly (readonly string[])[],
  exactPagination: boolean,
): void => {
  const actualMarkers = pageTexts.map((): string[] => [])
  const pageEnds = pageTexts.reduce<number[]>((ends, pageText) => {
    ends.push((ends.at(-1) ?? 0) + pageText.length)
    return ends
  }, [])
  const documentText = pageTexts.join('')
  let markerCursor = 0

  for (const { marker, maySplit, orphanText, text } of markerSamples) {
    const markerText = compactText(text)
    const markerIndex = documentText.indexOf(markerText, markerCursor)
    if (markerIndex === -1) throw new Error(`PDF marker text is missing: ${marker}`)
    const pageIndex = pageEnds.findIndex((pageEnd) => markerIndex < pageEnd)
    if (pageIndex === -1) throw new Error(`PDF marker page is missing: ${marker}`)
    actualMarkers[pageIndex]?.push(marker)
    markerCursor = markerIndex + markerText.length
    if (
      marker.startsWith('entry:') &&
      !maySplit &&
      !pageTexts.some((pageText) => pageText.includes(markerText))
    )
      throw new Error(`PDF record split across pages: ${marker}`)
    if (orphanText && !pageTexts.some((pageText) => pageText.includes(compactText(orphanText))))
      throw new Error(`PDF section heading is orphaned: ${marker}`)
  }

  if (pageTexts.some((pageText) => pageText.length === 0))
    throw new Error('Reference PDF has a blank page')
  const actualSignature = exactPagination ? actualMarkers : actualMarkers.flat()
  const expectedSignature = exactPagination ? expectedMarkers : expectedMarkers.flat()
  if (JSON.stringify(actualSignature) !== JSON.stringify(expectedSignature))
    throw new Error(
      `Pagination Signature mismatch:\n${JSON.stringify(actualSignature)}\n${JSON.stringify(expectedSignature)}`,
    )
}

const inspectPdf = async (
  pdf: Buffer,
  expectedMarkers: readonly (readonly string[])[],
  markerSamples: readonly MarkerSample[],
  expectedText: string,
  expectedLinks: readonly string[],
  exactPagination: boolean,
): Promise<void> => {
  const loadingTask = getDocument({ data: new Uint8Array(pdf) })
  const document = await loadingTask.promise
  if (document.numPages !== expectedMarkers.length)
    throw new Error(`Expected ${expectedMarkers.length} PDF pages, received ${document.numPages}`)

  const pages: PdfPageInspection[] = []
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    pages.push(await inspectPdfPage(document, pageNumber))
  }

  inspectPdfText(pages.map(({ text }) => text).join(''), expectedText)
  inspectPdfMarkers(
    pages.map(({ text }) => compactText(text)),
    markerSamples,
    expectedMarkers,
    exactPagination,
  )
  const links = pages.flatMap((page) => page.links)
  for (const link of expectedLinks)
    if (!links.includes(link)) throw new Error(`PDF link is inactive: ${link}`)
  await loadingTask.destroy()
}

const inspectEmbeddedFonts = (pdf: Buffer): void => {
  const root = mkdtempSync(join(tmpdir(), 'cv-ui-font-check-'))
  const path = join(root, 'capture.pdf')
  try {
    writeFileSync(path, pdf)
    const output = execFileSync('pdffonts', [path], { encoding: 'utf8' })
    const fonts = output.split('\n').flatMap((line) => {
      const columns = /^(\S+).*\s(yes|no)\s+(yes|no)\s+(yes|no)\s+\d+\s+\d+\s*$/u.exec(line)
      return columns ? [{ name: columns[1], embedded: columns[2] === 'yes' }] : []
    })
    if (fonts.length === 0) throw new Error('Reference PDF contains no fonts')
    if (!fonts.some((font) => font.name?.includes('Geist')))
      throw new Error('Reference PDF substituted the Clearline font')
    for (const font of fonts) {
      if (!font.embedded) throw new Error(`Reference PDF font is not embedded: ${font.name}`)
      if (!font.name?.includes('Geist') && !/(?:Apple|Noto)ColorEmoji/u.test(font.name ?? ''))
        throw new Error(`Reference PDF substituted font: ${font.name}`)
    }
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
}

const inspectLayout = async (page: import('playwright').Page): Promise<void> => {
  const result = await page.locator('article[data-cv-template="clearline"]').evaluate((article) => {
    const articleRect = article.getBoundingClientRect()
    const groups = [article, ...article.querySelectorAll('header, section, [data-cv-entry]')].map(
      (container) => [...container.children],
    )
    const invalid = [...article.querySelectorAll('*')].some((element) => {
      const rect = element.getBoundingClientRect()
      return (
        ![rect.x, rect.y, rect.width, rect.height].every(Number.isFinite) ||
        rect.left < articleRect.left - 1 ||
        rect.right > articleRect.right + 1 ||
        rect.top < articleRect.top - 1 ||
        rect.bottom > articleRect.bottom + 1
      )
    })
    const overlap = groups.some((elements) =>
      elements.some((element, index) => {
        const rect = element.getBoundingClientRect()
        return elements.slice(index + 1).some((sibling) => {
          const siblingRect = sibling.getBoundingClientRect()
          return (
            rect.right > siblingRect.left + 1 &&
            siblingRect.right > rect.left + 1 &&
            rect.bottom > siblingRect.top + 1 &&
            siblingRect.bottom > rect.top + 1
          )
        })
      }),
    )
    return {
      invalid,
      overlap,
      width: articleRect.width,
      scrollWidth: article.scrollWidth,
      fonts: document.fonts.status,
    }
  })
  if (result.invalid || result.overlap || result.fonts !== 'loaded')
    throw new Error(`Preview layout is incomplete: ${JSON.stringify(result)}`)
  if (Math.abs(result.width - 793.7) > 1 || result.scrollWidth > result.width + 1)
    throw new Error(`Preview layout clips horizontally: ${JSON.stringify(result)}`)
}

type CorpusCase = (typeof CV_ACCEPTANCE_CORPUS_V1)[number]

const inspectRenderedCase = async (
  page: import('playwright').Page,
  corpusCase: CorpusCase,
  browserName: string,
  failures: readonly string[],
): Promise<boolean> => {
  const state = await page.evaluate(() => window.cvUiPreviewState)
  if (!corpusCase.expected.success) {
    if (state !== 'rejected' || (await page.locator('[data-cv-template]').count()) !== 0)
      throw new Error(`${browserName} rendered invalid case ${corpusCase.id}`)
    return false
  }

  if (state !== 'ready') throw new Error(`${browserName} did not render ${corpusCase.id}`)
  await inspectLayout(page)
  if (failures.length > 0)
    throw new Error(`${browserName} ${corpusCase.id} failed:\n${failures.join('\n')}`)
  return true
}

const captureChromiumCase = async (
  page: import('playwright').Page,
  corpusCase: CorpusCase,
  browserName: string,
  onEnglishPdf?: (page: import('playwright').Page, pdf: Buffer) => Promise<void>,
): Promise<void> => {
  if (!('pagination' in corpusCase)) throw new Error(`Missing pagination: ${corpusCase.id}`)
  const expectedText = await page.locator('article').innerText()
  const expectedLinks = await page
    .locator('article a')
    .evaluateAll((links) =>
      links.flatMap((link) => (link instanceof HTMLAnchorElement ? [link.href] : [])),
    )
  const markerSamples = await page
    .locator('[data-cv-section], [data-cv-entry]')
    .evaluateAll((elements) =>
      elements.map((element) => {
        const section = element.getAttribute('data-cv-section')
        const entry = element.getAttribute('data-cv-entry')
        const heading = element.querySelector(':scope > h2') ?? element
        const firstContent =
          element.querySelector(':scope > :not(h2) > :first-child') ??
          element.querySelector(':scope > :not(h2)')
        if (!(heading instanceof HTMLElement)) throw new Error('Marker heading is invalid')
        const headingText = heading.innerText
        return {
          marker: `${section === null ? 'entry' : 'section'}:${section ?? entry ?? ''}`,
          text: headingText,
          orphanText:
            section !== null && firstContent instanceof HTMLElement
              ? `${headingText}${firstContent.innerText}`
              : null,
          maySplit: element.getBoundingClientRect().height > 1016,
        }
      }),
    )
  const pdf = sanitizePdfMetadata(
    await page.pdf({
      preferCSSPageSize: true,
      printBackground: true,
      tagged: true,
      outline: true,
    }),
  )
  try {
    if (corpusCase.id === 'en') await onEnglishPdf?.(page, pdf)
    await inspectPdf(
      pdf,
      corpusCase.pagination.clearline,
      markerSamples,
      expectedText,
      expectedLinks,
      corpusCase.id === 'en' || corpusCase.id === 'fr',
    )
    inspectEmbeddedFonts(pdf)
  } catch (error) {
    throw new Error(`${browserName} ${corpusCase.id}: ${String(error)}`)
  }
}

const captureBrowserCases = async (
  browserType: BrowserType,
  baseUrl: string,
  browserName: string,
  onEnglishPdf?: (page: import('playwright').Page, pdf: Buffer) => Promise<void>,
): Promise<void> => {
  const browser = await browserType.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 900, height: 1200 } })
    const failures: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`console: ${message.text()}`)
    })
    page.on('requestfailed', (request) => failures.push(`resource: ${request.url()}`))
    page.on('pageerror', (error) => failures.push(`page: ${error.message}`))

    for (const corpusCase of CV_ACCEPTANCE_CORPUS_V1) {
      failures.length = 0
      await page.goto(`${baseUrl}/scripts/preview.html?case=${encodeURIComponent(corpusCase.id)}`)
      await page.waitForFunction(() => window.cvUiPreviewState !== undefined)
      const rendered = await inspectRenderedCase(page, corpusCase, browserName, failures)
      if (rendered && browserType === chromium)
        await captureChromiumCase(page, corpusCase, browserName, onEnglishPdf)
    }
  } finally {
    await browser.close()
  }
}

const capturePreviews = async (outputRoot: string): Promise<void> => {
  const server = await createServer({
    configFile: false,
    root: repositoryRoot,
    plugins: [tailwindcss(), viteReact()],
    server: { host: '127.0.0.1', port: 0 },
  })
  await server.listen()
  const address = server.httpServer?.address()
  if (!address || typeof address === 'string') throw new Error('Preview server did not start')
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    await captureBrowserCases(chromium, baseUrl, 'Chromium', async (page, pdf) => {
      const previewRoot = join(outputRoot, 'previews/clearline')
      mkdirSync(join(previewRoot, 'pages'), { recursive: true })
      const pdfPath = join(previewRoot, 'reference.pdf')
      writeFileSync(pdfPath, pdf)
      const images = await page.evaluate(
        (encodedPdf) => window.renderCvUiPdfPages(encodedPdf),
        pdf.toString('base64'),
      )
      for (const [index, image] of images.entries()) {
        const bytes = Buffer.from(image.slice(image.indexOf(',') + 1), 'base64')
        const width = bytes.readUInt32BE(16)
        const height = bytes.readUInt32BE(20)
        if (width !== 1191 || height !== 1684)
          throw new Error(`Invalid page image geometry: ${width}x${height}`)
        writeFileSync(join(previewRoot, `pages/${String(index + 1).padStart(3, '0')}.png`), bytes)
      }
    })
    await captureBrowserCases(firefox, baseUrl, 'Firefox')
    await captureBrowserCases(webkit, baseUrl, 'WebKit')
  } finally {
    await server.close()
  }
}

const isMain = process.argv[1] ? resolve(process.argv[1]) === fileURLToPath(import.meta.url) : false
if (isMain) {
  const mode = process.argv.includes('--update') ? 'update' : 'check'
  await runPreviewCommand({
    mode,
    repositoryRoot,
    capture: capturePreviews,
    prepare: (outputRoot) => generateArtifacts(outputRoot),
    outputPaths: ['previews', ...GENERATED_OUTPUT_PATHS],
  })
  if (mode === 'check') checkGeneratedArtifacts(join(repositoryRoot, 'public'))
}
