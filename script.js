
const quotes = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "coding" },
  { text: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "coding" },
  { text: "Make it work, make it right, make it fast.", author: "Kent Beck", category: "coding" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House", category: "coding" },
  { text: "Starve your distractions, feed your focus.", author: "Daniel Goleman", category: "focus" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso", category: "focus" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear", category: "focus" },
  { text: "Done is better than perfect.", author: "Sheryl Sandberg", category: "mindset" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "mindset" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma", category: "mindset" },
  { text: "Good design is as little design as possible.", author: "Dieter Rams", category: "design" },
  { text: "Design is intelligence made visible.", author: "Alina Wheeler", category: "design" },
  { text: "Details are not the details. They make the design.", author: "Charles Eames", category: "design" }
];

let currentCategory = "all";
let currentQuote = quotes[0];

const quoteTag = document.getElementById("quoteTag");
const quoteText = document.getElementById("quoteText");
const quoteAuthor = document.getElementById("quoteAuthor");
const newQuoteBtn = document.getElementById("newQuoteBtn");
const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");
const toast = document.getElementById("toast");
const filterBtns = document.querySelectorAll(".filter-btn");
const themeBtns = document.querySelectorAll(".theme-btn");
const canvas = document.getElementById("exportCanvas");
const ctx = canvas.getContext("2d");

function showToast(message) {
  toast.textContent = message;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.textContent = "";
  }, 2200);
}

function getFilteredQuotes() {
  if (currentCategory === "all") return quotes;
  return quotes.filter((q) => q.category === currentCategory);
}

function renderRandomQuote() {
  const pool = getFilteredQuotes();
  if (pool.length === 0) return;

  let nextQuote = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length > 1) {
    while (nextQuote.text === currentQuote.text) {
      nextQuote = pool[Math.floor(Math.random() * pool.length)];
    }
  }

  currentQuote = nextQuote;
  quoteTag.textContent = currentQuote.category.toUpperCase();
  quoteText.textContent = `"${currentQuote.text}"`;
  quoteAuthor.textContent = `— ${currentQuote.author}`;
}

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.dataset.category;
    renderRandomQuote();
  });
});

themeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    themeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.body.className = btn.dataset.theme;
  });
});

newQuoteBtn.addEventListener("click", renderRandomQuote);

copyBtn.addEventListener("click", async () => {
  const formatted = `"${currentQuote.text}" — ${currentQuote.author}`;
  try {
    await navigator.clipboard.writeText(formatted);
    showToast("Copied to clipboard!");
  } catch {
    showToast("Unable to copy.");
  }
});

function wrapCanvasText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = context.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      context.fillText(line.trim(), x, currentY);
      line = words[i] + " ";
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  context.fillText(line.trim(), x, currentY);
  return currentY;
}

downloadBtn.addEventListener("click", () => {
  const styles = getComputedStyle(document.body);
  const bg = styles.getPropertyValue("--bg").trim();
  const surface = styles.getPropertyValue("--surface").trim();
  const border = styles.getPropertyValue("--border").trim();
  const text = styles.getPropertyValue("--text").trim();
  const muted = styles.getPropertyValue("--muted").trim();
  const accent = styles.getPropertyValue("--accent").trim();

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card
  const pad = 100;
  const cardW = canvas.width - pad * 2;
  const cardH = canvas.height - pad * 2;
  ctx.fillStyle = surface;
  ctx.strokeStyle = border;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.roundRect(pad, pad, cardW, cardH, 36);
  ctx.fill();
  ctx.stroke();

  // Category Tag
  ctx.fillStyle = accent;
  ctx.font = "bold 26px sans-serif";
  ctx.fillText(currentQuote.category.toUpperCase(), pad + 80, pad + 120);

  // Quote Text
  ctx.fillStyle = text;
  ctx.font = "bold 52px sans-serif";
  const lastY = wrapCanvasText(
    ctx,
    `"${currentQuote.text}"`,
    pad + 80,
    pad + 230,
    cardW - 160,
    74
  );

  // Author
  ctx.fillStyle = muted;
  ctx.font = "500 34px sans-serif";
  ctx.fillText(`— ${currentQuote.author}`, pad + 80, lastY + 90);

  // Export PNG
  const link = document.createElement("a");
  link.download = `quote-${currentQuote.category}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
  showToast("PNG card exported!");
});