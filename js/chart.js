/**
 * MarketInsight Canvas Chart Engine
 * Lightweight, zero-dependency responsive financial price chart
 */
class StockChart {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.data = [];
    this.resizeObserver = null;
    this.init();
  }

  init() {
    this.setupResize();
  }

  setupResize() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.render());
      this.resizeObserver.observe(this.canvas.parentElement);
    } else {
      window.addEventListener("resize", () => this.render());
    }
  }

  setData(dataPoints) {
    // dataPoints: [{ date: '2026-01-01', price: 120.50 }, ...]
    this.data = dataPoints || [];
    this.render();
  }

  render() {
    if (!this.canvas || !this.ctx) return;
    const parent = this.canvas.parentElement;
    const width = parent.clientWidth || 600;
    const height = 260;

    // Handle high DPI displays
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
      ctx.font = "13px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No historical price points available for this range", width / 2, height / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 30, left: 55 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const prices = this.data.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Determine trend color (green if last >= first, red if last < first)
    const isPositive = this.data[this.data.length - 1].price >= this.data[0].price;
    const lineColor = isPositive ? "#159765" : "#d64b55";
    const gradientTop = isPositive ? "rgba(21, 151, 101, 0.25)" : "rgba(214, 75, 85, 0.25)";

    // Draw horizontal grid lines
    ctx.strokeStyle = "#eef2f6";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8c9ba5";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "right";

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const yVal = minPrice + (priceRange * (gridLines - i)) / gridLines;
      const y = padding.top + (chartH * i) / gridLines;

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText("₹ " + yVal.toFixed(1), padding.left - 8, y + 4);
    }

    // Coordinates for price line
    const points = this.data.map((d, index) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.price - minPrice) / priceRange) * chartH;
      return { x, y, ...d };
    });

    // Draw gradient area
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

    // Draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();

    // Draw first and last date labels
    ctx.fillStyle = "#8c9ba5";
    ctx.textAlign = "left";
    ctx.fillText(this.data[0].date || "", padding.left, height - 8);
    ctx.textAlign = "right";
    ctx.fillText(this.data[this.data.length - 1].date || "", width - padding.right, height - 8);
  }
}

window.StockChart = StockChart;

