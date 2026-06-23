// ============================================
// joffeego.github.io — 交互增强
// 阅读进度条 · 回到顶部 · 代码复制 · 暗色模式切换 · 搜索
// ============================================

(function () {
  'use strict';

  // ---- 暗色模式 ---- //
  const THEME_KEY = 'theme';
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY); // 'dark' | 'light' | null
  }

  function applyTheme(mode) {
    // mode: 'dark' | 'light' | null (null = auto, follow OS)
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else if (mode === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.remove('dark', 'light');
    }
  }

  function updateThemeIcon(mode) {
    if (!themeIcon) return;
    // Figure out effective mode
    let effective = mode;
    if (!effective) {
      effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    themeIcon.textContent = effective === 'dark' ? '☀️' : '🌙';
  }

  function toggleTheme() {
    const current = getStoredTheme();
    let next;
    if (!current) {
      // go from auto → explicit, opposite of current OS preference
      next = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'light' : 'dark';
    } else if (current === 'dark') {
      next = 'light';
    } else {
      next = null; // back to auto
    }
    localStorage.setItem(THEME_KEY, next || '');
    applyTheme(next);
    updateThemeIcon(next);
  }

  // Init
  const stored = getStoredTheme();
  applyTheme(stored);
  updateThemeIcon(stored);

  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Listen for OS changes (only matters in auto mode)
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (!getStoredTheme()) {
      updateThemeIcon(null);
    }
  });

  // ---- 阅读进度条 ---- //
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    function updateProgress() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      const pct = Math.min((scrollTop / docHeight) * 100, 100);
      progressBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();
  }

  // ---- 回到顶部 ---- //
  const backBtn = document.getElementById('back-to-top');
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

  // ---- 代码复制 ---- //
  function initCodeCopy() {
    const pres = document.querySelectorAll('.post-content pre');
    pres.forEach(function (pre) {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return; // already wrapped
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

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
      return escaped.replace(regex, '<mark style="background:var(--accent-light);color:var(--accent);padding:0.1em 0.2em;border-radius:2px;">$1</mark>');
    }
  }

})();
