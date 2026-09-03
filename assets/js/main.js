/* Малый университет КФУ — общая логика сайта */
(function () {
  "use strict";

  /* ---------- Актуальный год в футере ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Рендеринг редактируемого контента из data/site-data.js ---------- */
  var DATA = window.SITE_DATA || {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function extLink(url, text, cls) {
    var a = el("a", cls, text);
    a.href = url;
    if (/^https?:/i.test(url)) {
      a.setAttribute("data-external", "");
      a.target = "_blank"; a.rel = "noopener";
    }
    return a;
  }

  /* Ссылки верхней панели */
  var topbarSlot = document.querySelector("[data-topbar-links]");
  if (topbarSlot && Array.isArray(DATA.topbarLinks)) {
    DATA.topbarLinks.forEach(function (l) {
      if (!l || !l.url || !l.title) return;
      topbarSlot.appendChild(extLink(l.url, l.title, l.external ? "" : ""));
    });
  }

  /* Кнопка официальной записи */
  var enrollSlot = document.querySelector("[data-enroll-slot]");
  if (enrollSlot) {
    if (DATA.enrollUrl) {
      var link = enrollSlot.querySelector("[data-enroll-link]");
      if (link) link.href = DATA.enrollUrl;
    } else {
      enrollSlot.innerHTML = "";
      var note = el("p", "note", "Ссылка на официальную систему записи будет опубликована администратором. Пока можно оставить заявку на консультацию в форме ниже.");
      enrollSlot.appendChild(note);
    }
  }

  /* Таблицы курсов по возрастным группам */
  document.querySelectorAll("tbody[data-courses]").forEach(function (tbody) {
    var list = (DATA.courses || {})[tbody.getAttribute("data-courses")] || [];
    if (!list.length) return; /* остаётся заглушка из HTML */
    tbody.innerHTML = "";
    list.forEach(function (c) {
      var tr = document.createElement("tr");

      var tdName = el("td");
      tdName.appendChild(el("strong", null, c.name || "Курс"));
      if (c.detailsUrl) {
        tdName.appendChild(document.createElement("br"));
        tdName.appendChild(extLink(c.detailsUrl, "Подробнее (карточка курса)", ""));
      }
      tr.appendChild(tdName);

      [c.grade, c.format, c.load, c.dates, c.price].forEach(function (v) {
        var td = el("td");
        if (v) { td.textContent = v; } else { td.innerHTML = '<span class="tbd">уточняется</span>'; }
        tr.appendChild(td);
      });

      var tdAct = el("td");
      var url = c.enrollUrl || DATA.enrollUrl;
      if (url) {
        var b = extLink(url, "Записаться", "btn btn--amber btn--small");
        tdAct.appendChild(b);
      } else {
        tdAct.innerHTML = '<span class="tbd">запись скоро откроется</span>';
      }
      tr.appendChild(tdAct);
      tbody.appendChild(tr);
    });
  });

  /* Афиша мероприятий: полный список и превью на главной */
  function eventItem(ev) {
    var li = document.createElement("li");
    li.appendChild(el("time", null, ev.date || "Дата уточняется"));
    var body = el("span");
    body.appendChild(el("span", "event-list__title", ev.title || "Событие"));
    if (ev.meta) {
      body.appendChild(document.createElement("br"));
      body.appendChild(el("span", "event-list__meta", ev.meta));
    }
    li.appendChild(body);
    if (ev.url) li.appendChild(extLink(ev.url, "Регистрация", "btn btn--outline btn--small"));
    return li;
  }
  var eventsList = document.querySelector("[data-events-list]");
  if (eventsList && (DATA.events || []).length) {
    eventsList.innerHTML = "";
    DATA.events.forEach(function (ev) { eventsList.appendChild(eventItem(ev)); });
  }
  var eventsPreview = document.querySelector("[data-events-preview]");
  if (eventsPreview && (DATA.events || []).length) {
    eventsPreview.innerHTML = "";
    var ul = el("ul", "event-list");
    DATA.events.slice(0, 3).forEach(function (ev) { ul.appendChild(eventItem(ev)); });
    eventsPreview.appendChild(ul);
  }

  /* Олимпиады: краткий блок на главной */
  var olyPreview = document.querySelector("[data-olympiads-preview]");
  if (olyPreview && (DATA.olympiads || []).length) {
    olyPreview.innerHTML = "";
    var ul2 = el("ul", "ticks");
    DATA.olympiads.forEach(function (o) {
      var li = el("li");
      li.appendChild(el("strong", null, o.title || "Олимпиада"));
      if (o.text) li.appendChild(document.createTextNode(" — " + o.text));
      ul2.appendChild(li);
    });
    olyPreview.appendChild(ul2);
  }

  /* Объявления и новости */
  var newsList = document.querySelector("[data-news-list]");
  if (newsList && (DATA.news || []).length) {
    newsList.innerHTML = "";
    var ul3 = el("ul", "event-list");
    DATA.news.forEach(function (n) {
      var li = document.createElement("li");
      li.appendChild(el("time", null, n.date || ""));
      var body = el("span");
      body.appendChild(el("span", "event-list__title", n.title || "Объявление"));
      if (n.text) {
        body.appendChild(document.createElement("br"));
        body.appendChild(el("span", "event-list__meta", n.text));
      }
      li.appendChild(body);
      if (n.url) li.appendChild(extLink(n.url, "Подробнее", "btn btn--outline btn--small"));
      ul3.appendChild(li);
    });
    newsList.appendChild(ul3);
  }


  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".main-nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("main-nav--open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  /* Подменю на мобильных: стрелка раскрывает, сам пункт остаётся ссылкой */
  document.querySelectorAll(".nav-item__caret").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".nav-item");
      var open = item.classList.toggle("nav-item--open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  /* ---------- Версия для слабовидящих ---------- */
  var SVI_KEY = "mu_svi";
  var sviBtns = document.querySelectorAll(".svi-toggle");
  function applySvi(on) {
    document.body.classList.toggle("svi", on);
    sviBtns.forEach(function (b) {
      b.setAttribute("aria-pressed", on ? "true" : "false");
      b.textContent = on ? "Обычная версия" : "Версия для слабовидящих";
    });
    try { localStorage.setItem(SVI_KEY, on ? "1" : "0"); } catch (e) {}
  }
  sviBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      applySvi(!document.body.classList.contains("svi"));
    });
  });
  try { if (localStorage.getItem(SVI_KEY) === "1") applySvi(true); } catch (e) {}

  /* ---------- Поиск по сайту ---------- */
  var INDEX = [
    { section: "Малый университет", title: "О Малом университете", url: "universitet.html", text: "курсы школьники 5 6 7 8 9 10 11 класс очно заочно" },
    { section: "Малый университет", title: "Курсы для 5–11 классов", url: "kursy.html", text: "расписание стоимость нагрузка формат записаться таблица" },
    { section: "Малый университет", title: "Нормативные документы", url: "universitet.html#documents", text: "лицензия оферта договор политика персональных данных" },
    { section: "Подготовка к ЕГЭ и ОГЭ", title: "Подготовка к ЕГЭ и ОГЭ", url: "ege-oge.html", text: "егэ огэ экзамен подготовка предметы 9 11 класс" },
    { section: "Олимпиады", title: "Олимпиады для школьников", url: "olimpiady.html", text: "олимпиада турнир этап перечень" },
    { section: "Мероприятия", title: "Мероприятия и афиша", url: "meropriyatiya.html", text: "события день открытых дверей афиша экскурсия" },
    { section: "Для иностранных граждан", title: "Информация для иностранных граждан", url: "foreign.html", text: "иностранные граждане поступление документы" },
    { section: "Запись", title: "Записаться на курс", url: "zapis.html", text: "запись заявка форма анкета" },
    { section: "Документы", title: "Политика обработки персональных данных", url: "politika.html", text: "персональные данные согласие конфиденциальность 152-фз cookie" }
  ];

  var searchPanel = document.querySelector(".search-panel");
  var searchOpenBtns = document.querySelectorAll(".search-open");
  var searchForm = document.querySelector(".search-panel form");
  var searchInput = document.querySelector("#site-search-input");
  var searchResults = document.querySelector(".search-results");

  function renderResults(query) {
    if (!searchResults) return;
    var q = query.trim().toLowerCase();
    searchResults.innerHTML = "";
    if (q.length < 2) { searchResults.innerHTML = '<p class="none">Введите не менее двух символов.</p>'; return; }
    var hits = INDEX.filter(function (item) {
      return (item.title + " " + item.text + " " + item.section).toLowerCase().indexOf(q) !== -1;
    });
    if (!hits.length) {
      searchResults.innerHTML = '<p class="none">По запросу «' + escapeHtml(query) + '» ничего не найдено. Попробуйте изменить формулировку.</p>';
      return;
    }
    var bySection = {};
    hits.forEach(function (h) { (bySection[h.section] = bySection[h.section] || []).push(h); });
    Object.keys(bySection).forEach(function (sec) {
      var block = document.createElement("div");
      var h = document.createElement("h3"); h.textContent = sec; block.appendChild(h);
      var ul = document.createElement("ul");
      bySection[sec].forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.url; a.textContent = item.title;
        li.appendChild(a); ul.appendChild(li);
      });
      block.appendChild(ul);
      searchResults.appendChild(block);
    });
  }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  searchOpenBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var open = searchPanel.classList.toggle("search-panel--open");
      b.setAttribute("aria-expanded", open ? "true" : "false");
      if (open && searchInput) searchInput.focus();
    });
  });
  if (searchForm) {
    searchForm.addEventListener("submit", function (e) { e.preventDefault(); renderResults(searchInput.value); });
    searchInput.addEventListener("input", function () { renderResults(searchInput.value); });
  }

  /* ---------- Переход во внешнюю систему записи ---------- */
  var dialog = document.querySelector(".ext-dialog");
  var dialogUrl = dialog ? dialog.querySelector(".ext-dialog__url") : null;
  var dialogGo = dialog ? dialog.querySelector("[data-ext-go]") : null;
  var dialogCancel = dialog ? dialog.querySelector("[data-ext-cancel]") : null;
  var pendingUrl = null;
  var lastTrigger = null;

  function openDialog(url, trigger) {
    pendingUrl = url; lastTrigger = trigger;
    if (dialogUrl) dialogUrl.textContent = url;
    dialog.classList.add("ext-dialog--open");
    if (dialogGo) dialogGo.focus();
  }
  function closeDialog() {
    dialog.classList.remove("ext-dialog--open");
    pendingUrl = null;
    if (lastTrigger) lastTrigger.focus();
  }
  document.querySelectorAll("[data-external]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      if (!dialog) return; /* без диалога ссылка работает как обычно (новая вкладка) */
      e.preventDefault();
      openDialog(link.href, link);
    });
  });
  if (dialog) {
    dialogGo.addEventListener("click", function () {
      if (pendingUrl) window.open(pendingUrl, "_blank", "noopener");
      closeDialog();
    });
    dialogCancel.addEventListener("click", closeDialog);
    dialog.querySelector(".ext-dialog__backdrop").addEventListener("click", closeDialog);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && dialog.classList.contains("ext-dialog--open")) closeDialog();
    });
  }

  /* ---------- Интерактивная иллюстрация первого экрана ---------- */
  var heroArt = document.querySelector(".hero__art");
  if (heroArt && matchMedia("(pointer: fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroArt.closest(".hero").addEventListener("mousemove", function (e) {
      var r = e.currentTarget.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      heroArt.style.transform = "translate(" + (x * 18) + "px," + (y * 12) + "px)";
    });
    heroArt.closest(".hero").addEventListener("mouseleave", function () {
      heroArt.style.transform = "";
    });
  }

  /* ---------- Cookie-баннер ---------- */
  var COOKIE_KEY = "mu_cookie_consent";
  var cookieBanner = document.querySelector(".cookie");
  function consentSaved() {
    try { return localStorage.getItem(COOKIE_KEY) !== null; } catch (e) { return true; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(COOKIE_KEY, JSON.stringify({ choice: value, at: new Date().toISOString() })); } catch (e) {}
    /* Счётчик Яндекс.Метрики подключается только после согласия на статистические cookie */
    if (value === "all" || value === "selected-stats") {
      document.documentElement.setAttribute("data-metrics-allowed", "true");
    }
  }
  if (cookieBanner && !consentSaved()) {
    setTimeout(function () { cookieBanner.classList.add("cookie--visible"); }, 900);
    cookieBanner.querySelector("[data-cookie-selected]").addEventListener("click", function () {
      var stats = cookieBanner.querySelector("#cookie-stats").checked;
      saveConsent(stats ? "selected-stats" : "selected-none");
      cookieBanner.classList.remove("cookie--visible");
    });
    cookieBanner.querySelector("[data-cookie-all]").addEventListener("click", function () {
      saveConsent("all");
      cookieBanner.classList.remove("cookie--visible");
    });
  }

  /* ---------- Демонстрационная форма заявки ---------- */
  var form = document.querySelector("form[data-demo-form]");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.querySelector(".form__status");
      var consent = form.querySelector("#f-consent");
      var repConsent = form.querySelector("#f-rep-consent");
      var pwd = form.querySelector("#f-password");
      var pwd2 = form.querySelector("#f-password-confirm");
      var errors = [];
      if (!consent.checked) errors.push("подтвердите согласие на обработку персональных данных");
      if (repConsent && !repConsent.checked) errors.push("подтвердите согласие законного представителя (для несовершеннолетних)");
      if (pwd && pwd.value !== pwd2.value) errors.push("пароль и подтверждение не совпадают");
      if (errors.length) {
        status.style.color = "#B00020";
        status.textContent = "Проверьте форму: " + errors.join("; ") + ".";
      } else {
        status.style.color = "#1B6E3C";
        status.textContent = "Заявка подготовлена. Это демонстрационная форма: данные никуда не отправляются. Для официальной записи используйте систему записи КФУ.";
        form.reset();
      }
      status.hidden = false;
      status.focus && status.focus();
    });
  }
})();
