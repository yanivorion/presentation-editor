import PptxGenJS from 'pptxgenjs';
import { SLIDE_W, SLIDE_H, themePalette } from './templates.jsx';

const PPTX_W = 13.333;
const PPTX_H = 7.5;
const IN_PER_PX = PPTX_W / SLIDE_W;

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

function themeToHex(color) {
  if (!color) return '000000';
  if (color.startsWith('#')) return color.slice(1);
  return '000000';
}

function addSlideTextBoxes(pptSlide, slide) {
  const f = slide.fields || {};
  const palette = themePalette(slide.theme);
  const bgHex = themeToHex(palette.bg);
  const inkHex = themeToHex(palette.ink);
  const mutedHex = themeToHex(palette.muted);

  pptSlide.background = { color: bgHex };

  switch (slide.template) {
    case 'cover': {
      if (f.eyebrow) {
        pptSlide.addText(stripHtml(f.eyebrow), {
          x: 0.4, y: 0.7, w: 5, h: 0.4,
          fontSize: 11, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true, charSpacing: 3,
        });
      }
      if (f.num) {
        pptSlide.addText(stripHtml(f.num), {
          x: 0.4, y: 2.5, w: 3, h: 1,
          fontSize: 60, fontFace: 'Helvetica Neue', color: inkHex,
          bold: false,
        });
      }
      if (f.title) {
        pptSlide.addText(stripHtml(f.title), {
          x: 0.4, y: 3.2, w: 10, h: 2,
          fontSize: 80, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true,
        });
      }
      if (f.blurb) {
        pptSlide.addText(stripHtml(f.blurb), {
          x: 0.4, y: 5.8, w: 7, h: 0.8,
          fontSize: 12, fontFace: 'Helvetica Neue', color: inkHex,
          transparency: 15,
        });
      }
      if (f.tag) {
        pptSlide.addText(stripHtml(f.tag), {
          x: 9, y: 6.5, w: 4, h: 0.4,
          fontSize: 9, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true, charSpacing: 2, align: 'right',
        });
      }
      break;
    }

    case 'sectionDivider': {
      if (f.bigNum) {
        pptSlide.addText(stripHtml(f.bigNum), {
          x: 0.4, y: 0.7, w: 3, h: 1.2,
          fontSize: 80, fontFace: 'Helvetica Neue', color: inkHex,
        });
      }
      if (f.title) {
        pptSlide.addText(stripHtml(f.title), {
          x: 0.4, y: 2.2, w: 10, h: 2,
          fontSize: 72, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true,
        });
      }
      if (f.bullets) {
        const text = (Array.isArray(f.bullets) ? f.bullets : []).map(b => stripHtml(b)).join('\n');
        pptSlide.addText(text, {
          x: 0.4, y: 5, w: 8, h: 2,
          fontSize: 11, fontFace: 'Helvetica Neue', color: mutedHex,
          lineSpacing: 18,
        });
      }
      break;
    }

    case 'twoColumn': {
      if (f.bigNum) {
        pptSlide.addText(stripHtml(f.bigNum), {
          x: 0.4, y: 0.7, w: 3, h: 1,
          fontSize: 80, fontFace: 'Helvetica Neue', color: inkHex,
        });
      }
      if (f.label) {
        pptSlide.addText(stripHtml(f.label), {
          x: 0.4, y: 1.6, w: 5, h: 0.4,
          fontSize: 11, fontFace: 'Helvetica Neue', color: mutedHex,
          bold: true, charSpacing: 2,
        });
      }
      if (f.title) {
        pptSlide.addText(stripHtml(f.title), {
          x: 0.4, y: 2.3, w: 5.5, h: 1.5,
          fontSize: 40, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true,
        });
      }
      if (f.body) {
        pptSlide.addText(stripHtml(f.body), {
          x: 0.4, y: 4.2, w: 5.5, h: 2.5,
          fontSize: 12, fontFace: 'Helvetica Neue', color: inkHex,
          lineSpacing: 20,
        });
      }
      const listItems = f.colAItems || f.colBItems || f.items || [];
      if (Array.isArray(listItems) && listItems.length > 0) {
        const text = listItems.map(it => `• ${stripHtml(typeof it === 'string' ? it : it.t || it.text || '')}`).join('\n');
        pptSlide.addText(text, {
          x: 7, y: 2.3, w: 5.5, h: 4.5,
          fontSize: 12, fontFace: 'Helvetica Neue', color: inkHex,
          lineSpacing: 20,
        });
      }
      break;
    }

    default: {
      const allText = [];
      const extract = (obj, depth = 0) => {
        if (!obj || depth > 3) return;
        for (const [, val] of Object.entries(obj)) {
          if (typeof val === 'string' && val.trim()) {
            allText.push(stripHtml(val));
          } else if (Array.isArray(val)) {
            val.forEach(item => {
              if (typeof item === 'string') allText.push(stripHtml(item));
              else if (item && typeof item === 'object') extract(item, depth + 1);
            });
          } else if (val && typeof val === 'object') {
            extract(val, depth + 1);
          }
        }
      };
      extract(f);

      if (allText.length > 0) {
        const title = allText[0];
        const body = allText.slice(1).join('\n\n');
        pptSlide.addText(title, {
          x: 0.4, y: 0.7, w: 12, h: 1.5,
          fontSize: 36, fontFace: 'Helvetica Neue', color: inkHex,
          bold: true,
        });
        if (body) {
          pptSlide.addText(body, {
            x: 0.4, y: 2.5, w: 12, h: 4.5,
            fontSize: 14, fontFace: 'Helvetica Neue', color: inkHex,
            lineSpacing: 22,
          });
        }
      }
      break;
    }
  }

  if (slide.elements && slide.elements.length > 0) {
    slide.elements.forEach(el => {
      if (el.visible === false) return;
      const elX = el.x * IN_PER_PX;
      const elY = el.y * IN_PER_PX;
      const elW = el.w * IN_PER_PX;
      const elH = el.h * IN_PER_PX;

      if (el.type === 'text' || el.type === 'title') {
        pptSlide.addText(stripHtml(el.content || ''), {
          x: elX, y: elY, w: elW, h: elH,
          fontSize: el.type === 'title' ? 28 : 14,
          fontFace: el.style?.fontFamily || 'Helvetica Neue',
          color: themeToHex(el.style?.color || palette.ink),
          bold: el.style?.fontWeight === 'bold' || el.style?.fontWeight >= 600,
          italic: el.style?.fontStyle === 'italic',
        });
      } else if (el.type === 'shape') {
        pptSlide.addShape('rect', {
          x: elX, y: elY, w: elW, h: elH,
          fill: { color: themeToHex(el.style?.fill || '#cccccc') },
        });
      } else if (el.type === 'line') {
        pptSlide.addShape('line', {
          x: elX, y: elY, w: elW, h: 0,
          line: { color: themeToHex(el.style?.stroke || '#000000'), width: 2 },
        });
      } else if (el.type === 'box') {
        pptSlide.addShape('rect', {
          x: elX, y: elY, w: elW, h: elH,
          line: { color: themeToHex(el.style?.stroke || '#000000'), width: 2 },
          fill: { color: themeToHex(el.style?.fill || 'ffffff'), transparency: el.style?.fill === 'transparent' ? 100 : 0 },
        });
      }
    });
  }
}

export async function exportPptx(deck) {
  const pptx = new PptxGenJS();
  pptx.title = deck.title || 'Presentation';
  pptx.layout = 'LAYOUT_WIDE';

  for (const slide of deck.slides) {
    const pptSlide = pptx.addSlide();
    addSlideTextBoxes(pptSlide, slide);
  }

  await pptx.writeFile({ fileName: `${(deck.title || 'presentation').replace(/\s+/g, '-')}.pptx` });
}

export function exportJson(deck) {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(deck.title || 'presentation').replace(/\s+/g, '-')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportImageZip(deck, renderSlideToCanvas) {
  if (!renderSlideToCanvas) return;
  const images = [];
  for (let i = 0; i < deck.slides.length; i++) {
    const dataUrl = await renderSlideToCanvas(deck.slides[i], i);
    images.push(dataUrl);
  }
  for (let i = 0; i < images.length; i++) {
    const a = document.createElement('a');
    a.href = images[i];
    a.download = `slide-${String(i + 1).padStart(2, '0')}.png`;
    a.click();
    await new Promise(r => setTimeout(r, 200));
  }
}

export function importJson(onLoad) {
  const inp = document.createElement('input');
  inp.type = 'file';
  inp.accept = '.json,.pptx';
  inp.onchange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          onLoad({
            title: imported.title || 'Imported Deck',
            slides: imported.slides || [],
            globalHeader: imported.globalHeader || { elements: [] },
            globalFooter: imported.globalFooter || { elements: [] },
            headerEnabled: imported.headerEnabled ?? true,
            footerEnabled: imported.footerEnabled ?? true,
          });
        } catch {
          alert('Invalid JSON file');
        }
      };
      reader.readAsText(f);
    } else {
      alert('PPTX import is not yet supported. Please use JSON format.');
    }
  };
  inp.click();
}
