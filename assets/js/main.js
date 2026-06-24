// ============================================
// joffeego.github.io — 交互增强
// 阅读进度条 · 回到顶部 · 代码复制 · 入场动画 · 液态搜索
// ============================================

(function () {
  'use strict';

  /* ==========================================
     1) 阅读进度条 + 回到顶部进度环
     ========================================== */
  var backBtn = document.getElementById('back-to-top');
  var ringFill = backBtn ? backBtn.querySelector('.progress-ring-fill') : null;
  var RING_CIRC = 113.1;
  if (backBtn) {
    function toggleBackBtn() {
      backBtn.classList.toggle('visible', window.scrollY > 400);
    }
    window.addEventListener('scroll', toggleBackBtn, { passive: true });
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggleBackBtn();
  }

  var progressBar = document.getElementById('progress-bar');
  function updateProgressAll() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = 0;
    if (docHeight > 0) pct = Math.min((scrollTop / docHeight) * 100, 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (ringFill) ringFill.style.strokeDashoffset = RING_CIRC - (RING_CIRC * pct / 100);
  }
  if (progressBar || ringFill) {
    window.addEventListener('scroll', updateProgressAll, { passive: true });
    updateProgressAll();
  }

  /* ==========================================
     2) 入场动画（更柔和的 stagger）
     ========================================== */
  function initReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.reveal:not(.is-visible)'));
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // 用索引做轻微 stagger，但用 IntersectionObserver 不易拿到索引
        // 所以用 entry.boundingClientRect 距离视口顶部的偏移做基础延迟
        var offset = Math.max(0, entry.boundingClientRect.top);
        var delay = Math.min(offset * 0.06, 200);
        setTimeout(function () {
          entry.target.classList.add('is-visible');
        }, delay);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  initReveal();

  /* ==========================================
     3) 代码块复制
     ========================================== */
  function initCodeCopy() {
    var pres = document.querySelectorAll('.post-content pre');
    Array.prototype.forEach.call(pres, function (pre) {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var lang = '';
      var lm = pre.className.match(/language-(\w+)/) ||
              (pre.querySelector('code') && pre.querySelector('code').className.match(/language-(\w+)/));
      if (lm) lang = lm[1];
      if (!lang) {
        var hl = pre.closest('.highlight');
        if (hl) {
          var m = hl.className.match(/language-(\w+)/);
          if (m) lang = m[1];
        }
      }
      if (lang) {
        var label = document.createElement('span');
        label.className = 'code-lang';
        label.textContent = lang;
        wrapper.appendChild(label);
      }

      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.type = 'button';
      btn.textContent = '复制';
      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        var code = pre.textContent || '';
        var done = function () {
          btn.textContent = '已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(done).catch(function () {
            btn.textContent = '失败';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = code; document.body.appendChild(ta); ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {
            btn.textContent = '失败';
            setTimeout(function () { btn.textContent = '复制'; }, 1500);
          }
          document.body.removeChild(ta);
        }
      });
    });
  }
  initCodeCopy();

  /* ==========================================
     4) 液态搜索 overlay
     ========================================== */
  var OVERLAY_HTML =
    '<div class="search-overlay" id="search-overlay" hidden>' +
      '<div class="search-overlay-bg" data-search-close></div>' +
      '<button class="search-close" type="button" data-search-close aria-label="关闭搜索">&times;</button>' +
      '<div class="search-panel">' +
        '<p class="search-hint">' +
          '在写作簿中检索 <kbd>Esc</kbd> 关闭' +
        '</p>' +
        '<div class="search-input-wrapper">' +
          '<span class="search-icon" aria-hidden="true">&#8981;</span>' +
          '<input type="search" id="search-input" placeholder="搜索文章标题、摘要或分类…" autocomplete="off" spellcheck="false">' +
        '</div>' +
        '<ul id="search-results"></ul>' +
        '<p id="no-results" style="display:none;">没有找到匹配的文章</p>' +
      '</div>' +
    '</div>';

  var overlay, root, searchInput, searchResults, noResultsEl;
  var searchData = null;
  var isOverlayOpen = false;
  var lastFocused = null;

  function ensureOverlay() {
    if (overlay) return;
    var fragment = document.createElement('div');
    fragment.innerHTML = OVERLAY_HTML.trim();
    overlay = fragment.firstElementChild;
    document.body.appendChild(overlay);
    root = overlay;

    searchInput   = root.querySelector('#search-input');
    searchResults = root.querySelector('#search-results');
    noResultsEl   = root.querySelector('#no-results');

    // 点击空白 / 关闭按钮 → 关闭
    Array.prototype.forEach.call(root.querySelectorAll('[data-search-close]'), function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        closeOverlay();
      });
    });

    searchInput.addEventListener('input', function () {
      doSearch(searchInput.value.trim());
    });

    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeOverlay(); }
    });
  }

  function openOverlay(originX, originY) {
    ensureOverlay();
    isOverlayOpen = true;
    lastFocused = document.activeElement;

    // 触发点 → 圆心坐标（以视口百分比形式存储到 CSS 变量）
    var ox = ((originX != null ? originX : window.innerWidth / 2) / window.innerWidth) * 100;
    var oy = ((originY != null ? originY : window.innerHeight / 2) / window.innerHeight) * 100;
    root.style.setProperty('--ox', ox + '%');
    root.style.setProperty('--oy', oy + '%');

    overlay.hidden = false;
    overlay.style.display = 'flex';
    // 强制 reflow 以适配 transition
    void overlay.offsetWidth;

    overlay.classList.remove('is-closing');
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // 推迟聚焦避免触屏键盘自动弹出，并保证入场动画完整
    setTimeout(function () {
      if (searchInput) searchInput.focus({ preventScroll: true });
    }, 320);

    loadSearchData();
  }

  function closeOverlay() {
    if (!overlay || !isOverlayOpen) return;
    isOverlayOpen = false;
    overlay.classList.remove('is-open');
    overlay.classList.add('is-closing');
    document.body.style.overflow = '';

    setTimeout(function () {
      overlay.style.display = 'none';
      overlay.classList.remove('is-closing');
      overlay.hidden = true;
      if (searchInput) searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
      if (noResultsEl) noResultsEl.style.display = 'none';
    }, 640);

    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus({ preventScroll: true }); } catch (e) {}
    }
  }

  function loadSearchData() {
    if (searchData) return Promise.resolve(searchData);
    return fetch(pathPrefix() + 'search.json', { cache: 'force-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchData = data;
        return data;
      })
      .catch(function () {
        searchData = [];
        if (searchResults) {
          searchResults.innerHTML = '<li class="search-result-item" style="color:var(--faint)">搜索索引加载失败，请稍后再试。</li>';
        }
      });
  }

  function pathPrefix() {
    var p = document.querySelector('meta[name="search-root"]') || (window.__searchRoot || '');
    if (p && p.content) return p.content;
    return '/';
  }

  function doSearch(query) {
    if (!searchData) { loadSearchData().then(function () { doSearch(query); }); return; }
    if (!query || query.length < 1) {
      searchResults.innerHTML = '';
      if (noResultsEl) noResultsEl.style.display = 'none';
      return;
    }
    var q = query.toLowerCase();
    var results = searchData.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) > -1 ||
             item.excerpt.toLowerCase().indexOf(q) > -1 ||
             (item.categories || []).some(function (c) { return c.toLowerCase().indexOf(q) > -1; });
    });

    if (results.length === 0) {
      searchResults.innerHTML = '';
      if (noResultsEl) noResultsEl.style.display = 'block';
      return;
    }
    if (noResultsEl) noResultsEl.style.display = 'none';

    searchResults.innerHTML = results.map(function (item) {
      var cats = (item.categories || []).map(function (c) {
        return '<span class="category-tag">' + escapeHtml(c) + '</span>';
      }).join('');
      var excerpt = highlightMatch(item.excerpt, q);
      return '' +
        '<li class="search-result-item">' +
          '<a href="' + item.url + '">' + highlightMatch(item.title, q) + '</a>' +
          '<div class="search-result-meta"><time>' + item.date + '</time>' + (cats ? ' · ' + cats : '') + '</div>' +
          '<div class="search-result-excerpt">' + excerpt + '</div>' +
        '</li>';
    }).join('');
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
  function highlightMatch(text, query) {
    var escaped = escapeHtml(text);
    if (!query) return escaped;
    var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    return escaped.replace(regex, '<mark style="background:var(--accent-soft);color:var(--accent);padding:0.02em 0.22em;border-radius:3px;">$1</mark>');
  }

  // 绑定所有触发器
  Array.prototype.forEach.call(document.querySelectorAll('[data-search-trigger]'), function (trigger) {
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var rect = trigger.getBoundingClientRect();
      // 用触发按钮的中心点作为液态展开的原点
      openOverlay(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
  });

  // 全局快捷键：⌘K / Ctrl+K
  window.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.keyCode === 75)) {
      e.preventDefault();
      if (isOverlayOpen) closeOverlay();
      else {
        var rect = null;
        openOverlay(window.innerWidth / 2, 80);
      }
    }
    // 已聚焦在 overlay 外时按 Esc 保险
    if (e.key === 'Escape' && isOverlayOpen) {
      e.preventDefault();
      closeOverlay();
    }
  });

  // 修复：overlay 关闭后保持滚动位置（因设了 overflow:hidden）
  // 上面已恢复 overflow，无需额外处理。

})();