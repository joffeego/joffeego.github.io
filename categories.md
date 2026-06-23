---
layout: default
title: 分类
permalink: /categories/
---

<div class="page-header">
  <span class="page-eyebrow">Topics</span>
  <h1 class="page-heading">分类</h1>
  <p class="page-subtitle">按主题浏览所有文章</p>
</div>

{% assign all_categories = "" | split: "" %}
{% for post in site.posts %}
  {% for cat in post.categories %}
    {% assign all_categories = all_categories | push: cat %}
  {% endfor %}
{% endfor %}
{% assign unique_categories = all_categories | uniq | sort %}

{% if unique_categories.size > 0 %}
<div class="categories-list">
  {% for cat in unique_categories %}
  <a class="category-tag" href="#{{ cat | slugify }}">{{ cat }}</a>
  {% endfor %}
</div>

{% for cat in unique_categories %}
{% assign cat_count = 0 %}
{% for post in site.posts %}
  {% if post.categories contains cat %}
    {% assign cat_count = cat_count | plus: 1 %}
  {% endif %}
{% endfor %}
<div class="category-section" id="{{ cat | slugify }}">
  <h2>{{ cat }} <span class="count">{{ cat_count }} 篇</span></h2>
  <ul>
    {% for post in site.posts %}
      {% if post.categories contains cat %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <time>{{ post.date | date: "%Y-%m-%d" }}</time>
      </li>
      {% endif %}
    {% endfor %}
  </ul>
</div>
{% endfor %}
{% else %}
<div class="empty-state"><p>暂无文章分类。</p></div>
{% endif %}