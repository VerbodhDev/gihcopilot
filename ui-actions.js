/**
 * UI Actions helper for Bucks2Bar
 *
 * Provides utility functions to attach behaviors to buttons, inputs, toggles,
 * and to download the chart canvas as a PNG. Designed to be non-invasive:
 * - checks for element presence before binding
 * - uses delegation for dynamically-generated inputs (month inputs)
 *
 * Usage:
 *   // Basic initialization with default example bindings:
 *   UiActions.init();
 *
 *   // Or initialize with options:
 *   UiActions.init({
 *     canvasId: 'bucksChart',
 *     downloadBtnId: 'downloadChartBtn',
 *     monthInputsContainer: '#monthsBody'
 *   });
 *
 * Exposed helpers:
 *   - init(options)
 *   - bindChartDownload({ canvasId, downloadBtnId, filenamePrefix })
 *   - onButtonClick(buttonId, handler)
 *   - onInputChange(containerSelector, inputSelector, handler) // delegation
 *   - onToggleChange(toggleId, handler)
 */
(function () {
  'use strict';

  // Small util helpers
  function q(id) {
    if (!id) return null;
    return document.getElementById(id);
  }

  function exists(el) {
    return el !== null && el !== undefined;
  }

  function safeCall(fn) {
    try {
      fn && fn();
    } catch (e) {
      // avoid throwing during UI binding; surface to console for debugging
      console.error('UiActions: handler error', e);
    }
  }

  // Attach a click handler to a button by id (no-op if missing)
  function onButtonClick(buttonId, handler) {
    const btn = q(buttonId);
    if (!btn) {
      console.debug(`UiActions: button "${buttonId}" not found`);
      return () => {};
    }
    const wrapped = (ev) => safeCall(() => handler(ev));
    btn.addEventListener('click', wrapped);
    // return an unsubscribe function
    return () => btn.removeEventListener('click', wrapped);
  }

  // Attach a delegated input handler within a container.
  // Useful for inputs that are created dynamically (like month rows).
  // containerSelector can be a CSS selector (e.g. '#monthsBody')
  // inputSelector is matched against event.target using matches()
  function onInputChange(containerSelector, inputSelector, handler) {
    const container = document.querySelector(containerSelector);
    if (!container) {
      console.debug(`UiActions: container "${containerSelector}" not found`);
      return () => {};
    }
    const wrapped = (ev) => {
      const target = ev.target;
      if (!target || typeof target.matches !== 'function') return;
      if (target.matches(inputSelector)) {
        safeCall(() => handler(ev, target));
      }
    };
    container.addEventListener('input', wrapped);
    return () => container.removeEventListener('input', wrapped);
  }

  // Attach a change handler to a toggle (checkbox/switch) by id
  function onToggleChange(toggleId, handler) {
    const toggle = q(toggleId);
    if (!toggle) {
      console.debug(`UiActions: toggle "${toggleId}" not found`);
      return () => {};
    }
    const wrapped = (ev) => safeCall(() => handler(ev, toggle.checked));
    toggle.addEventListener('change', wrapped);
    return () => toggle.removeEventListener('change', wrapped);
  }

  // Download a canvas as PNG. Uses toBlob() when available for better memory usage.
  // Options:
  //   - canvasId: id of the canvas element
  //   - downloadBtnId: id of the button that triggers download
  //   - filenamePrefix: prefix for generated filename (timestamp appended)
  // Returns unsubscribe (removes click listener) or noop if binding didn't occur.
  function bindChartDownload({
    canvasId = 'bucksChart',
    downloadBtnId = 'downloadChartBtn',
    filenamePrefix = 'bucks-chart',
  } = {}) {
    const canvas = q(canvasId);
    const btn = q(downloadBtnId);
    if (!btn) {
      console.debug(`UiActions: download button "${downloadBtnId}" not found`);
      return () => {};
    }

    const clickHandler = async (ev) => {
      ev.preventDefault();
      // Create readable filename with timestamp
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${filenamePrefix}-${ts}.png`;

      if (!canvas) {
        alert('Chart is not available to download.');
        return;
      }

      // Try to ensure chart is up-to-date if a global Bucks2Bar object exists
      try {
        if (window.Bucks2Bar && typeof window.Bucks2Bar.updateChartData === 'function') {
          window.Bucks2Bar.updateChartData();
        }
      } catch (e) {
        // ignore update errors
      }

      // Prefer toBlob (asynchronous and memory-friendly)
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) {
            alert('Failed to create image blob.');
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          // revoke after a short delay to allow download to start
          setTimeout(() => URL.revokeObjectURL(url), 1500);
        }, 'image/png', 1.0);
        return;
      }

      // Fallback to data URL
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        console.error('UiActions: chart download failed', e);
        alert('Failed to download chart. Your browser may not support canvas downloads.');
      }
    };

    btn.addEventListener('click', clickHandler);
    return () => btn.removeEventListener('click', clickHandler);
  }

  // Example high-level bindings for common controls that exist in the page.
  // These are opinionated convenience handlers you can call from your app init.
  function bindDefaultExamples(options = {}) {
    // Bind reset button to animate table inputs and confirm (keeps original behavior)
    onButtonClick('resetBtn', () => {
      // Visual cue for reset: briefly flash month inputs background
      const container = document.querySelector(options.monthInputsContainer || '#monthsBody');
      if (container) {
        container.classList.add('ui-flash-reset');
        setTimeout(() => container.classList.remove('ui-flash-reset'), 450);
      }
      // Keep the original behaviour (if the page has its own reset handler, it will also run)
      console.info('UiActions: reset requested (visual flash applied).');
    });

    // Fill demo button: show a short message and highlight totals
    onButtonClick('fillDemoBtn', () => {
      const totals = document.querySelectorAll('.totals');
      totals.forEach((el) => {
        el.classList.add('text-success');
      });
      setTimeout(() => totals.forEach((el) => el.classList.remove('text-success')), 900);
      console.info('UiActions: fill demo (visual highlight).');
    });

    // Export button: show a short confirmation (the page implements actual export)
    onButtonClick('exportBtn', () => {
      alert('Export initiated — check clipboard or follow the prompt to save JSON.');
    });

    // Import button: provide a gentle reminder about format
    onButtonClick('importBtn', () => {
      alert('Import expects a JSON object with `income` and `expense` arrays (12 values each).');
    });

    // Example: react to month input changes to apply a simple validation UI
    onInputChange(options.monthInputsContainer || '#monthsBody', 'input[type="number"]', (ev, inputEl) => {
      const value = Number(inputEl.value) || 0;
      // Visual helper: darken inputs when value is zero, lighten when > 0
      if (value <= 0) {
        inputEl.style.opacity = '0.7';
      } else {
        inputEl.style.opacity = '1';
      }
      // Example validation: warn if value is extremely large
      if (value > 1_000_000) {
        inputEl.style.border = '2px solid #ffcc00';
        inputEl.title = 'Large value — please confirm this amount';
      } else {
        inputEl.style.border = '';
        inputEl.title = '';
      }
    });

    // Toggle handlers to provide additional explanation or sync UI pieces
    onToggleChange('stackToggle', (ev, checked) => {
      console.info('UiActions: stackToggle ->', checked);
      // Optionally show a small helper tooltip/message (simple alert for demo)
      // but avoid annoying users: only show first-time hint stored in session
      try {
        const key = 'bucks2bar-seen-stack-hint';
        if (!sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          // Non-blocking hint
          setTimeout(() => {
            if (confirm('Stacked bars are now ' + (checked ? 'on' : 'off') + '. Would you like to keep this setting?')) {
              // nothing - example placeholder
            }
          }, 50);
        }
      } catch (e) {
        // ignore storage errors (private mode)
      }
    });

    onToggleChange('showExpenseToggle', (ev, checked) => {
      console.info('UiActions: showExpenseToggle ->', checked);
      // Visual hint: if hiding expenses, make expense dataset less prominent in legend (if chart exists)
      if (window.Bucks2Bar && window.Bucks2Bar.createChart && window.Bucks2Bar.updateChartData) {
        // updateChartData will handle visibility; we just log here
        // (this is safe to call even if the page has its own handlers)
        safeCall(() => window.Bucks2Bar.updateChartData());
      }
    });

    // Bind chart download helper with passed or default options
    bindChartDownload({
      canvasId: options.canvasId || 'bucksChart',
      downloadBtnId: options.downloadBtnId || 'downloadChartBtn',
      filenamePrefix: options.filenamePrefix || 'bucks-chart',
    });
  }

  // Init function: call this from your main app to attach example UI actions.
  // Accepts the same options used above.
  function init(options = {}) {
    // add a small CSS helper for the reset flash animation if not already present
    if (!document.getElementById('ui-actions-styles')) {
      const style = document.createElement('style');
      style.id = 'ui-actions-styles';
      style.innerHTML = `
        .ui-flash-reset { animation: uiFlashReset 420ms ease; }
        @keyframes uiFlashReset {
          0% { background-color: rgba(255,255,255,0.02); }
          50% { background-color: rgba(255,105,180,0.08); } /* subtle pink flash */
          100% { background-color: transparent; }
        }
      `;
      document.head.appendChild(style);
    }

    // Bind the default examples; keep call idempotent
    try {
      bindDefaultExamples(options);
      console.info('UiActions: initialized with options', options);
    } catch (e) {
      console.error('UiActions: initialization failed', e);
    }
  }

  // Expose API
  window.UiActions = {
    init,
    bindChartDownload,
    onButtonClick,
    onInputChange,
    onToggleChange,
  };
})();
