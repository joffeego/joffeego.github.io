---
layout: default
title: 分类
permalink: /categories/
---

{% assign all_categories = "" | split: "" %}
{% for post in site.posts %}
  {% for cat in post.categories %}
    {% assign all_categories = all_categories | push: cat %}
  {% endfor %}
{% endfor %}
{% assign unique_categories = all_categories | uniq | sort %}

<div class="categories-list">
  {% for cat in unique_categories %}
  <a class="category-tag" href="#{{ cat | slugify }}">{{ cat }}</a>
  {% endfor %}
</div>

{% for cat in unique_categories %}
<div class="category-section" id="{{ cat | slugify }}">
  <h2>{{ cat }}</h2>
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
