// ============================================
// joffeego.github.io — 交互增强
// 阅读进度条 · 回到顶部 · 代码复制 · 入场动画 · 搜索
// ============================================

(function () {
  'use strict';

  // ---- 阅读进度条 + 回到顶部进度环 ---- //
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

  // ---- 入场动画 ---- //
  function initReveal() {
    var items = document.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window) || !items.length) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          setTimeout(function () { entry.target.classList.add('is-visible'); }, i * 70);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  initReveal();

  // ---- 代码复制 ---- //
  function initCodeCopy() {
    var pres = document.querySelectorAll('.post-content pre');
    pres.forEach(function (pre) {
      if (pre.parentElement.classList.contains('code-block-wrapper')) return;
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var lang = '';
      var langMatch = pre.className.match(/language-(\w+)/) ||
                      (pre.querySelector('code') && pre.querySelector('code').className.match(/language-(\w+)/));
      if (langMatch) lang = langMatch[1];
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
        navigator.clipboard.writeText(code).then(function () {
          btn.textContent = '已复制';
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
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');
  var noResults = document.getElementById('no-results');

  if (searchInput && searchResults) {
    var searchData = [];

    fetch('/search.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        searchData = data;
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          searchInput.value = q;
          doSearch(q);
        }
      })
      .catch(function () {
        searchResults.innerHTML = '<li class="search-result-item" style="color:var(--faint)">搜索索引加载失败</li>';
      });

    searchInput.addEventListener('input', function () {
      doSearch(searchInput.value.trim());
    });

    function doSearch(query) {
      if (!query || query.length < 1) {
        searchResults.innerHTML = '';
        if (noResults) noResults.style.display = 'none';
        return;
      }

      var q = query.toLowerCase();
      var results = searchData.filter(function (item) {
        return item.title.toLowerCase().includes(q) ||
               item.excerpt.toLowerCase().includes(q) ||
               (item.categories || []).some(function (c) { return c.toLowerCase().includes(q); });
      });

      if (results.length === 0) {
        searchResults.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
      }

      if (noResults) noResults.style.display = 'none';
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
      return escaped.replace(regex, '<mark style="background:var(--accent-soft);color:var(--accent);padding:0.02em 0.22em;border-radius:3px;">$1</mark>');
    }
  }

})();