#!/usr/bin/env node
/**
 * Inline all CSS, JS, and images into a single HTML file
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../out');

function getContentType(filepath) {
  const ext = filepath.split('.').pop().toLowerCase();
  const types = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'eot': 'application/vnd.ms-fontobject',
  };
  return types[ext] || 'application/octet-stream';
}

function toBase64DataUri(filepath) {
  try {
    const content = readFileSync(filepath);
    const contentType = getContentType(filepath);
    return `data:${contentType};base64,${content.toString('base64')}`;
  } catch (e) {
    console.warn(`Warning: Could not read file ${filepath}`);
    return null;
  }
}

function resolveAssetPath(href, baseDir) {
  // Handle paths starting with / or /_next
  if (href.startsWith('/')) {
    return join(outDir, href);
  }
  return join(baseDir, href);
}

function escapeScriptContent(js) {
  // Escape sequences that would break inline scripts:
  // 1. </script> - would prematurely close the script tag
  // 2. <script - opening tags in strings can confuse HTML parsers
  // 3. <!-- - could cause issues with HTML comment parsing
  // Note: We use explicit backslash character to ensure literal backslash in output
  const backslash = String.fromCharCode(92); // backslash character
  return js
    // Escape closing tags first
    .replace(/<\/script>/gi, '<' + backslash + '/script>')
    .replace(/<\/script/gi, '<' + backslash + '/script')
    // Escape opening tags - use unicode escape for the 's' to break the pattern
    .replace(/<script/gi, '<' + backslash + 'u0073cript')
    // Escape HTML comments
    .replace(/<!--/g, '<' + backslash + '!--');
}

function patchRuntime(js) {
  // Patch Next.js/Turbopack runtime to handle inline scripts (no src attribute)
  
  // Patch 1: Handle null src attribute
  js = js.replace(
    /\.getAttribute\("src"\)\)\.replace\(/g,
    '.getAttribute("src")||"").replace('
  );
  
  // Patch 2: Handle the /_next/ validation check - bypass it entirely
  js = js.replace(
    /let\{pathname:(\w+)\}=new URL\((\w+)\.src\),(\w+)=\1\.indexOf\("\/_next\/"\);if\(-1===\3\)throw/g,
    'let $1=$2.src?"/_next/inline":"/_next/inline",$3=$1.indexOf("/_next/");if(false)throw'
  );
  
  // Patch 3: Handle new URL(e.src) - provide fallback URL
  js = js.replace(
    /new URL\((\w+)\.src\)/g,
    'new URL($1&&$1.src||"http://localhost/_next/inline.js")'
  );
  
  // Patch 4: Replace document.currentScript with a mock object
  // The chunks use: "object"==typeof document?document.currentScript:void 0
  // The runtime expects this to be a script element with getAttribute method
  // We provide a mock that returns safe values
  js = js.replace(
    /"object"==typeof document\?document\.currentScript:void 0/g,
    '({getAttribute:function(){return null},src:""})'
  );
  
  return js;
}

function inlineCSS(html, baseDir) {
  // Inline <link rel="stylesheet"> tags
  return html.replace(
    /<link\s+[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*\/?>/gi,
    (match, href) => {
      const cssPath = resolveAssetPath(href, baseDir);
      if (existsSync(cssPath)) {
        let cssContent = readFileSync(cssPath, 'utf-8');
        // Inline any url() references in the CSS
        cssContent = inlineCSSUrls(cssContent, dirname(cssPath));
        return `<style>${cssContent}</style>`;
      }
      console.warn(`Warning: CSS file not found: ${cssPath}`);
      return match;
    }
  );
}

function inlineCSSUrls(css, baseDir) {
  // Inline url() references in CSS
  return css.replace(
    /url\(["']?([^"')]+)["']?\)/gi,
    (match, url) => {
      if (url.startsWith('data:') || url.startsWith('http')) {
        return match;
      }
      const assetPath = resolveAssetPath(url, baseDir);
      if (existsSync(assetPath)) {
        const dataUri = toBase64DataUri(assetPath);
        if (dataUri) {
          return `url("${dataUri}")`;
        }
      }
      return match;
    }
  );
}

function inlineJS(html, baseDir) {
  // Inline scripts directly as content (not data URIs)
  // Remove async attribute to ensure proper execution order
  return html.replace(
    /<script\s+([^>]*)src=["']([^"']+)["']([^>]*)><\/script>/gi,
    (match, before, src, after) => {
      const jsPath = resolveAssetPath(src, baseDir);
      if (existsSync(jsPath)) {
        let jsContent = readFileSync(jsPath, 'utf-8');
        // Escape sequences that would break inline scripts
        jsContent = escapeScriptContent(jsContent);
        // Patch runtime to handle null src attribute
        jsContent = patchRuntime(jsContent);
        // Remove async/defer and src attributes
        let attrs = (before + after).replace(/\s*(async|defer)(="")?/gi, '').trim();
        return `<script ${attrs}>${jsContent}</script>`;
      }
      console.warn(`Warning: JS file not found: ${jsPath}`);
      return match;
    }
  );
}

function inlineImages(html, baseDir) {
  // Inline <img src="..."> tags
  return html.replace(
    /<img\s+([^>]*)src=["']([^"']+)["']([^>]*)\/?>/gi,
    (match, before, src, after) => {
      if (src.startsWith('data:') || src.startsWith('http')) {
        return match;
      }
      const imgPath = resolveAssetPath(src, baseDir);
      if (existsSync(imgPath)) {
        const dataUri = toBase64DataUri(imgPath);
        if (dataUri) {
          return `<img ${before}src="${dataUri}"${after}>`;
        }
      }
      return match;
    }
  );
}

function inlineFavicons(html, baseDir) {
  // Inline <link rel="icon"> tags
  return html.replace(
    /<link\s+([^>]*)rel=["'](icon|apple-touch-icon|shortcut icon)["']([^>]*)href=["']([^"']+)["']([^>]*)\/?>/gi,
    (match, before, rel, middle, href, after) => {
      if (href.startsWith('data:') || href.startsWith('http')) {
        return match;
      }
      const iconPath = resolveAssetPath(href, baseDir);
      if (existsSync(iconPath)) {
        const dataUri = toBase64DataUri(iconPath);
        if (dataUri) {
          return `<link ${before}rel="${rel}"${middle}href="${dataUri}"${after}>`;
        }
      }
      return match;
    }
  );
}

function removePreloadLinks(html) {
  // Remove <link rel="preload"> tags for fonts since they'll be embedded in CSS
  html = html.replace(
    /<link\s+[^>]*rel=["']preload["'][^>]*as=["']font["'][^>]*\/?>/gi,
    ''
  );
  // Remove <link rel="preload"> tags for scripts since they'll be inlined
  html = html.replace(
    /<link\s+[^>]*rel=["']preload["'][^>]*as=["']script["'][^>]*\/?>/gi,
    ''
  );
  // Remove <link rel="modulepreload"> tags since scripts will be inlined
  html = html.replace(
    /<link\s+[^>]*rel=["']modulepreload["'][^>]*\/?>/gi,
    ''
  );
  return html;
}

function inlineAllScripts(html, baseDir) {
  // More robust script inlining - handles various attribute orders
  // Inlines scripts directly as content
  // Removes async/defer to ensure proper execution order
  const scriptRegex = /<script([^>]*)><\/script>/gi;
  
  return html.replace(scriptRegex, (match, attrs) => {
    // Extract src attribute
    const srcMatch = attrs.match(/src=["']([^"']+)["']/);
    if (!srcMatch) {
      return match; // No src, keep as-is (inline script)
    }
    
    const src = srcMatch[1];
    // Skip if already processed (no external path)
    if (src.startsWith('data:') || !src.startsWith('/')) {
      return match;
    }
    
    const jsPath = resolveAssetPath(src, baseDir);
    
    if (existsSync(jsPath)) {
      let jsContent = readFileSync(jsPath, 'utf-8');
      // Escape and patch
      jsContent = escapeScriptContent(jsContent);
      jsContent = patchRuntime(jsContent);
      // Remove src and async/defer attributes
      let newAttrs = attrs
        .replace(/\s*src=["'][^"']+["']\s*/g, ' ')
        .replace(/\s*(async|defer)(="")?/gi, '')
        .trim();
      return `<script ${newAttrs}>${jsContent}</script>`;
    }
    
    console.warn(`Warning: JS file not found: ${jsPath}`);
    return match;
  });
}

function injectChunkLoader(html) {
  // Add debug script to understand what's happening
  const debugScript = `
<script>
window.addEventListener('load', function() {
  console.log('=== Debug Info ===');
  console.log('TURBOPACK type:', typeof globalThis.TURBOPACK);
  console.log('TURBOPACK value:', globalThis.TURBOPACK);
  console.log('TURBOPACK isArray:', Array.isArray(globalThis.TURBOPACK));
  if (globalThis.TURBOPACK && typeof globalThis.TURBOPACK === 'object') {
    console.log('TURBOPACK keys:', Object.keys(globalThis.TURBOPACK).slice(0, 10));
  }
  console.log('__next_f:', self.__next_f ? self.__next_f.length + ' items' : 'undefined');
  console.log('React:', typeof React !== 'undefined' ? 'loaded' : 'not loaded');
  console.log('ReactDOM:', typeof ReactDOM !== 'undefined' ? 'loaded' : 'not loaded');
  
  // Check for canvas
  var canvas = document.querySelector('canvas');
  console.log('Canvas element:', canvas ? canvas.width + 'x' + canvas.height : 'not found');
  
  // Check if there are any errors stored
  if (window.__NEXT_DATA__) {
    console.log('__NEXT_DATA__:', window.__NEXT_DATA__);
  }
});
</script>`;

  // Insert before </body>
  return html.replace(/<\/body>/i, debugScript + '</body>');
}

function main() {
  const inputFile = join(outDir, 'index.html');
  const outputFile = join(outDir, 'ai-bom.html');

  if (!existsSync(inputFile)) {
    console.error(`Error: ${inputFile} not found. Run 'next build' first.`);
    process.exit(1);
  }

  console.log('Reading index.html...');
  let html = readFileSync(inputFile, 'utf-8');

  console.log('Removing font preload links...');
  html = removePreloadLinks(html);

  console.log('Inlining CSS...');
  html = inlineCSS(html, outDir);

  console.log('Inlining JavaScript (pass 1)...');
  html = inlineJS(html, outDir);

  console.log('Inlining JavaScript (pass 2)...');
  html = inlineAllScripts(html, outDir);

  console.log('Inlining images...');
  html = inlineImages(html, outDir);

  console.log('Inlining favicons...');
  html = inlineFavicons(html, outDir);

  console.log('Injecting chunk loader override...');
  html = injectChunkLoader(html);

  console.log(`Writing ${outputFile}...`);
  writeFileSync(outputFile, html);

  const stats = {
    input: readFileSync(inputFile).length,
    output: readFileSync(outputFile).length,
  };

  console.log(`\nDone!`);
  console.log(`  Input:  ${(stats.input / 1024).toFixed(1)} KB`);
  console.log(`  Output: ${(stats.output / 1024).toFixed(1)} KB`);
  console.log(`\nOutput file: ${outputFile}`);
}

main();
