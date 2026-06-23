// ============================================
// joffeego.github.io — 交互增强
// 阅读进度条 · 回到顶部 · 代码复制 · 暗色模式切换 · 搜索
// ============================================

(function () {
  'use strict';

  // ---- 暗色模式切换 ---- //
  const THEME_KEY = 'theme';
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function applyTheme(m) {
    if (m === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (m === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark', 'light');
    }
  }

  function updateThemeIcon(m) {
    if (!themeIcon) return;
    let eff = m;
    if (!eff) eff = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    themeIcon.textContent = eff === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const cur = getStoredTheme();
    let next;
    if (!cur) {
      next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    } else if (cur === 'dark') {
      next = 'light';
    } else {
      next = null;
    }
    localStorage.setItem(THEME_KEY, next || '');
    applyTheme(next);
    updateThemeIcon(next);
  }

  const stored = getStoredTheme();
  applyTheme(stored);
  updateThemeIcon(stored);

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!getStoredTheme()) updateThemeIcon(null);
  });

  // ---- 阅读进度条 + 回到顶部进度环 ---- //
  const backBtn = document.getElementById('back-to-top');
  const ringFill = backBtn ? backBtn.querySelector('.progress-ring-fill') : null;
  const RING_CIRC = 119.4;
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

  const progressBar = document.getElementById('progress-bar');
  function updateProgressAll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    let pct = 0;
    if (docHeight > 0) pct = Math.min((scrollTop / docHeight) * 100, 100);
    if (progressBar) progressBar.style.width = pct + '%';
    if (ringFill) ringFill.style.strokeDashoffset = RING_CIRC - (RING_CIRC * pct / 100);
  }
  if (progressBar || ringFill) {
    window.addEventListener('scroll', updateProgressAll, { passive: true });
    updateProgressAll();
  }

  // ---- 入场动画 ---- //
  function initReveal() {
    const items = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 60);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  initReveal();

  // ---- 代码复制 ---- //
  function initCodeCopy() {
    const pres = document.querySelectorAll('.post-content pre');
    pres.forEach(function (pre) {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return; // already wrapped
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // 语言标签：从 highlighter 包裹的 class="highlight language-xxx" 或 code 的 class 中取
      let lang = '';
      const langMatch = pre.className.match(/language-(\w+)/) ||
                        (pre.querySelector('code') && pre.querySelector('code').className.match(/language-(\w+)/));
      if (langMatch) lang = langMatch[1];
      if (!lang) {
        const hl = pre.closest('.highlight');
        if (hl) {
          const m = hl.className.match(/language-(\w+)/);
          if (m) lang = m[1];
        }
      }
      if (lang) {
        const label = document.createElement('span');
        label.className = 'code-lang';
        label.textContent = lang;
        wrapper.appendChild(label);
      }

      const btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '复制';
      wrapper.appendChild(btn);

      btn.addEventListener('click', function () {
        const code = pre.textContent || '';
        navigator.clipboard.writeText(code).then(function () {
          btn.textContent = '✓ 已复制';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = '复制';
            btn.classList.remove('copied');
          }, 2000);
        }).catch(function () {
          btn.textContent = '失败';
          setTimeout(function () { btn.textContent = '复制'; }, 1500);
        });
      });
    });
  }

  initCodeCopy();

  // ---- 搜索页面 ---- //
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const noResults = document.getElementById('no-results');

  if (searchInput && searchResults) {
    let searchData = [];

    // Load search index
    fetch('/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchData = data;
        // Support ?q= query param
        const params = new URLSearchParams(window.location.search);
        const q = params.get('q');
        if (q) {
          searchInput.value = q;
          doSearch(q);
        }
      })
      .catch(function () {
        searchResults.innerHTML = '<li class="search-result-item" style="color:var(--text-tertiary)">搜索索引加载失败</li>';
      });

    searchInput.addEventListener('input', function () {
      doSearch(searchInput.value.trim());
    });

    function doSearch(query) {
      if (!query || query.length < 1) {
        searchResults.innerHTML = '';
        noResults.style.display = 'none';
        return;
      }

      const q = query.toLowerCase();
      const results = searchData.filter(function (item) {
        return item.title.toLowerCase().includes(q) ||
               item.excerpt.toLowerCase().includes(q) ||
               (item.categories || []).some(function (c) { return c.toLowerCase().includes(q); });
      });

      if (results.length === 0) {
        searchResults.innerHTML = '';
        noResults.style.display = 'block';
        return;
      }

      noResults.style.display = 'none';
      searchResults.innerHTML = results.map(function (item) {
        var cats = (item.categories || []).map(function (c) {
          return '<span class="category-tag">' + escapeHtml(c) + '</span>';
        }).join('');

        var highlighted = highlightMatch(item.excerpt, q);

        return '<li class="search-result-item">' +
          '<a href="' + item.url + '">' + highlightMatch(item.title, q) + '</a>' +
          '<div class="search-result-meta">' +
            '<time>' + item.date + '</time>' +
            (cats ? ' · ' + cats : '') +
          '</div>' +
          '<div class="search-result-excerpt">' + highlighted + '</div>' +
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
      return escaped.replace(regex, '<mark style="background:var(--accent-soft);color:var(--accent);padding:0.05em 0.25em;border-radius:3px;font-weight:600;">$1</mark>');
    }
  }

})();
