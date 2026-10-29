
"use strict";

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "quiztracker.sessions.v1";

let language = "fa";
let sessions = loadSessions();
let chart = null;

function t(fa, en) {
  return language === "fa" ? fa : en;
}

function loadSessions() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveSessions() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function todayISO() {
  const now = new Date();

  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("-");
}

function formatDate(value) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");

  return language === "fa"
    ? `${year}/${month}/${day}`
    : `${month}/${day}/${year}`;
}

// ---------- Session table ----------
function renderTable() {
  const rows = $("sessionRows");
  const emptyState = $("emptyState");

  if (!rows || !emptyState) return;

  emptyState.hidden = sessions.length > 0;

  rows.innerHTML = sessions.map((session, index) => {
    const correct = Number(session.correct) || 0;
    const total = Number(session.total) || 0;

    const percentage = total > 0
      ? Math.round((correct / total) * 100)
      : 0;

    return `
      <tr>
        <td>${t("جلسه", "Session")} ${index + 1}</td>
        <td class="correct-cell">${correct}</td>
        <td>${total}</td>
        <td class="rate-cell">${percentage}%</td>
        <td>${formatDate(session.date)}</td>
        <td>
          <button
            class="delete-btn"
            type="button"
            data-delete="${session.id}"
            aria-label="${t("حذف جلسه", "Delete session")}"
          >×</button>
        </td>
      </tr>
    `;
  }).join("");
}

// ---------- Progress chart ----------
function drawChart() {
  const canvas = document.getElementById("progressChart");
  const chartData = document.getElementById("chartData");
  const emptyMessage = document.getElementById("chartEmpty");

  if (!canvas || !chartData || !window.Chart) return;

  const items = [...chartData.querySelectorAll("span")];

  const labels = items.map(item =>
    `جلسه ${item.dataset.session}`
  );

  const values = items.map(item =>
    Number(item.dataset.dorost) || 0
  );

  if (chart) {
    chart.destroy();
    chart = null;
  }

  if (emptyMessage) {
    emptyMessage.hidden = items.length > 0;
  }

  if (items.length === 0) return;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);

  gradient.addColorStop(0, "rgba(255, 134, 23, 0.25)");
  gradient.addColorStop(1, "rgba(255, 134, 23, 0)");

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "کلمه درست گفته شده",
        data: values,
        borderColor: "#ff8617",
        backgroundColor: gradient,
        pointBackgroundColor: "#ff8617",
        pointRadius: 4,
        borderWidth: 2.5,
        tension: 0.32,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          onClick: () => {}
        }
      },

      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}
// ---------- Render page ----------
function render() {
  renderTable();
  drawChart();
}

// ---------- Language ----------
function setLanguage(nextLanguage) {
  language = nextLanguage;

  document.documentElement.lang = language;
  document.documentElement.dir = language === "fa" ? "rtl" : "ltr";

  document.body.classList.toggle("en", language === "en");

  document.querySelectorAll("[data-fa][data-en]").forEach(element => {
    element.textContent = element.dataset[language];
  });

  const languageButton = $("languageBtn");

  if (languageButton) {
    languageButton.textContent =
      language === "fa" ? "EN / فارسی" : "فارسی / EN";
  }

  render();
}

$("languageBtn")?.addEventListener("click", () => {
  setLanguage(language === "fa" ? "en" : "fa");
});

// ---------- Open add-session dialog ----------
$("addSessionBtn")?.addEventListener("click", () => {
  const dialog = $("sessionDialog");
  if (!dialog) return;

  $("dateInput").value = todayISO();
  $("correctInput").value = "";
  $("totalInput").value = "20";
  $("formError").textContent = "";

  dialog.showModal();
  $("correctInput").focus();
});

function closeDialog() {
  $("sessionDialog")?.close();
}

$("closeDialog")?.addEventListener("click", closeDialog);
$("cancelBtn")?.addEventListener("click", closeDialog);

// ---------- Add session ----------
$("sessionForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const correct = Number($("correctInput").value);
  const total = Number($("totalInput").value);
  const date = $("dateInput").value;
  const error = $("formError");

  if (
    !Number.isInteger(correct) ||
    !Number.isInteger(total) ||
    correct < 0 ||
    total < 1 ||
    correct > total ||
    !date
  ) {
    error.textContent = t(
      "اطلاعات را بررسی کن؛ تعداد جواب درست باید بین صفر و کل سؤال‌ها باشد.",
      "Check the values. Correct answers must be between zero and total questions."
    );

    return;
  }

  sessions.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    correct,
    total,
    date
  });

  saveSessions();
  render();
  closeDialog();
});

// ---------- Delete session ----------
$("sessionRows")?.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");

  if (!button) return;

  sessions = sessions.filter(session =>
    String(session.id) !== button.dataset.delete
  );

  saveSessions();
  render();
});

// ---------- Navigation ----------
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach(item => {
      item.classList.remove("active");
    });

    link.classList.add("active");
  });
});

// ---------- Start ----------
render();
