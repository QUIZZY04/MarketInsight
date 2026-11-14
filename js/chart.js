/**
 * MarketInsight Canvas Chart Engine
 * Lightweight, interactive responsive financial price chart with hover tooltips and dynamic timeframes
 */
class StockChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.data = [];
    this.range = "1Y";
    this.hoverIndex = null;
    this.resizeObserver = null;
    this.init();
  }

  init() {
    this.setupResize();
    this.setupInteractivity();
  }

  setupResize() {
    if (window.ResizeObserver && this.canvas.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.render());
      this.resizeObserver.observe(this.canvas.parentElement);
    } else {
      window.addEventListener("resize", () => this.render());
    }
  }

  setupInteractivity() {
    const handleMove = (clientX, clientY) => {
      if (!this.data || this.data.length < 2) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const padding = { left: 55, right: 20 };
      const chartW = rect.width - padding.left - padding.right;
      if (x < padding.left || x > rect.width - padding.right) {
        this.hoverIndex = null;
        this.render();
        return;
      }
      const ratio = (x - padding.left) / chartW;
      const idx = Math.min(this.data.length - 1, Math.max(0, Math.round(ratio * (this.data.length - 1))));
      if (this.hoverIndex !== idx) {
        this.hoverIndex = idx;
        this.render();
      }
    };

    this.canvas.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
    this.canvas.addEventListener("mouseleave", () => {
      this.hoverIndex = null;
      this.render();
    });

    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener("touchmove", (e) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });

    this.canvas.addEventListener("touchend", () => {
      this.hoverIndex = null;
      this.render();
    });
  }

  setData(dataPoints, range) {
    this.data = dataPoints || [];
    if (range) this.range = range;
    this.hoverIndex = null;
    this.render();
  }

  formatDate(dateStr) {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mon = months[d.getMonth()];
      const year = String(d.getFullYear()).slice(-2);
      if (this.range === "1M" || this.range === "3M") {
        return `${day} ${mon}`;
      } else if (this.range === "5Y" || this.range === "ALL" || this.range === "MAX") {
        return `${mon} '${year}`;
      }
      return `${day} ${mon} '${year}`;
    } catch {
      return dateStr;
    }
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = 260;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + "px";
    this.canvas.style.height = height + "px";

    const ctx = this.ctx;
    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    if (!this.data || this.data.length < 2) {
      ctx.fillStyle = "#8c9ba5";
      ctx.font = "13px Inter, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No historical price points available for this timeframe", width / 2, height / 2);
      return;
    }

    const padding = { top: 24, right: 20, bottom: 32, left: 60 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const prices = this.data.map(d => Number(d.price) || 0);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = (maxPrice - minPrice) || 1;

    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const isPositive = lastPrice >= firstPrice;
    const lineColor = isPositive ? "#159765" : "#d64b55";
    const gradientTop = isPositive ? "rgba(21, 151, 101, 0.22)" : "rgba(214, 75, 85, 0.22)";

    // Horizontal grid lines
    ctx.strokeStyle = "#eef2f6";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8c9ba5";
    ctx.font = "11px Inter, -apple-system, sans-serif";
    ctx.textAlign = "right";

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = minPrice + (priceRange * (gridLines - i)) / gridLines;
      const y = padding.top + (chartH * i) / gridLines;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      const label = yVal >= 1000 ? "₹ " + yVal.toLocaleString("en-IN", { maximumFractionDigits: 0 }) : "₹ " + yVal.toFixed(1);
      ctx.fillText(label, padding.left - 8, y + 4);
    }

    // Coordinates for all price points
    const points = this.data.map((d, index) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartW;
      const p = Number(d.price) || minPrice;
      const y = padding.top + chartH - ((p - minPrice) / priceRange) * chartH;
      return { x, y, price: p, date: d.date || d.tradeDate || "" };
    });

    // Gradient fill under the price curve
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, padding.top + chartH);
    ctx.lineTo(points[0].x, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Price line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.stroke();

    // Date labels on X axis
    ctx.fillStyle = "#8c9ba5";
    ctx.font = "11px Inter, -apple-system, sans-serif";
    const numLabels = Math.min(5, this.data.length);
    for (let k = 0; k < numLabels; k++) {
      const idx = Math.round((k / (numLabels - 1)) * (points.length - 1));
      const pt = points[idx];
      const dateText = this.formatDate(pt.date);
      if (k === 0) {
        ctx.textAlign = "left";
        ctx.fillText(dateText, padding.left, height - 10);
      } else if (k === numLabels - 1) {
        ctx.textAlign = "right";
        ctx.fillText(dateText, width - padding.right, height - 10);
      } else {
        ctx.textAlign = "center";
        ctx.fillText(dateText, pt.x, height - 10);
      }
    }

    // Hover interactive state
    if (this.hoverIndex !== null && points[this.hoverIndex]) {
      const active = points[this.hoverIndex];

      // Vertical cursor line
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(active.x, padding.top);
      ctx.lineTo(active.x, padding.top + chartH);
      ctx.stroke();
      ctx.restore();

      // Pulsing circle at intersection
      ctx.beginPath();
      ctx.arc(active.x, active.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = lineColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      ctx.stroke();

      // Floating Tooltip Bubble
      const tipDate = this.formatDate(active.date);
      const tipPrice = "₹ " + Number(active.price).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const tipText = `${tipDate}  •  ${tipPrice}`;
      ctx.font = "bold 12px Inter, -apple-system, sans-serif";
      const textWidth = ctx.measureText(tipText).width;
      const boxW = textWidth + 24;
      const boxH = 28;

      let boxX = active.x - boxW / 2;
      boxX = Math.max(padding.left, Math.min(width - padding.right - boxW, boxX));
      const boxY = Math.max(padding.top - 8, active.y - 38);

      // Tooltip background
      ctx.fillStyle = "#1e293b";
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxW, boxH, 6);
      ctx.fill();

      // Tooltip text
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(tipText, boxX + boxW / 2, boxY + 18);
    }
  }
}

window.StockChart = StockChart;
