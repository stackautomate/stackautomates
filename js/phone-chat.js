// Canvas Chat Animation - reusable component for phone mockups
class ChatAnimator {
  constructor(canvasId, messages, options = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    // Filter out blank/placeholder messages (no-reply state) entirely
    this.messages = messages.filter(m => m.text && m.text.trim() !== '...' && m.text.trim() !== '');
    this.theme = options.theme || 'light';
    this.currentIndex = 0;
    this.cycleTime = 0;
    this.messageShowTime = 2000;
    this.messagePause = 1000;
    this.fullCycleDuration = (this.messages.length * (this.messageShowTime + this.messagePause)) + 3000;

    this.colors = this.theme === 'dark' ? {
      bg: '#0b1119',
      received: '#1a2233',
      receivedText: '#F3F4F6',
      sent: '#10B981',
      sentText: '#0A0F17',
      timeText: '#6B7280'
    } : {
      bg: '#f5f5f5',
      received: '#e5e5ea',
      receivedText: '#000000',
      sent: '#25D366',
      sentText: '#ffffff',
      timeText: '#8a8a8a'
    };

    this.resize();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const width = parent.clientWidth;
    const height = parent.clientHeight;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.ctx.scale(dpr, dpr);

    this.displayWidth = width;
    this.displayHeight = height;
  }

  wrapText(text, maxWidth) {
    this.ctx.font = '400 12px Inter, Arial, sans-serif';
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = this.ctx.measureText(testLine).width;
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  drawMessage(x, y, text, isReceived, time, isAuto) {
    const padding = 12;
    const radius = 12;
    const msgWidth = Math.min(this.displayWidth * 0.72, 210);
    const textMaxWidth = msgWidth - (padding * 2);
    const lineHeight = 16;

    const lines = this.wrapText(text, textMaxWidth);
    const msgHeight = (lines.length * lineHeight) + (padding * 1.6);

    // Bubble background
    this.ctx.fillStyle = isReceived ? this.colors.received : this.colors.sent;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + msgWidth - radius, y);
    this.ctx.quadraticCurveTo(x + msgWidth, y, x + msgWidth, y + radius);
    this.ctx.lineTo(x + msgWidth, y + msgHeight - radius);
    this.ctx.quadraticCurveTo(x + msgWidth, y + msgHeight, x + msgWidth - radius, y + msgHeight);
    this.ctx.lineTo(x + radius, y + msgHeight);
    this.ctx.quadraticCurveTo(x, y + msgHeight, x, y + msgHeight - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();

    // Message text
    this.ctx.fillStyle = isReceived ? this.colors.receivedText : this.colors.sentText;
    this.ctx.font = '400 12px Inter, Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';

    lines.forEach((line, i) => {
      this.ctx.fillText(line, x + padding, y + (padding * 0.8) + (i * lineHeight));
    });

    // Timestamp
    this.ctx.fillStyle = this.colors.timeText;
    this.ctx.font = '400 9px Inter, Arial, sans-serif';
    this.ctx.textAlign = isReceived ? 'left' : 'right';
    this.ctx.fillText(time, isReceived ? x + padding : x + msgWidth - padding, y + msgHeight + 10);

    let extraOffset = 18;
    if (isAuto) {
      this.ctx.fillStyle = this.colors.timeText;
      this.ctx.font = 'italic 400 8px Inter, Arial, sans-serif';
      this.ctx.fillText('Auto-reply ⚡', isReceived ? x + padding : x + msgWidth - padding, y + msgHeight + 22);
      extraOffset = 30;
    }

    return y + msgHeight + extraOffset;
  }

  animate = () => {
    this.ctx.clearRect(0, 0, this.displayWidth, this.displayHeight);
    this.ctx.fillStyle = this.colors.bg;
    this.ctx.fillRect(0, 0, this.displayWidth, this.displayHeight);

    if (this.messages.length === 0) {
      requestAnimationFrame(this.animate);
      return;
    }

    const numVisible = Math.floor(this.cycleTime / (this.messageShowTime + this.messagePause)) + 1;
    const visibleCount = Math.min(numVisible, this.messages.length);

    // First pass: calculate total height needed for visible messages
    let totalHeight = 12;
    for (let i = 0; i < visibleCount; i++) {
      const msg = this.messages[i];
      const msgWidth = Math.min(this.displayWidth * 0.72, 210);
      const textMaxWidth = msgWidth - 24;
      const lines = this.wrapText(msg.text, textMaxWidth);
      const msgHeight = (lines.length * 16) + (12 * 1.6);
      const extraOffset = msg.auto ? 30 : 18;
      totalHeight += msgHeight + extraOffset;
    }

    // If content exceeds canvas height, calculate scroll offset
    const scrollOffset = Math.max(0, totalHeight - this.displayHeight + 12);

    this.ctx.save();
    this.ctx.translate(0, -scrollOffset);

    let y = 12;
    for (let i = 0; i < visibleCount; i++) {
      const msg = this.messages[i];
      const msgWidth = Math.min(this.displayWidth * 0.72, 210);
      const x = msg.isReceived ? 10 : this.displayWidth - msgWidth - 10;
      y = this.drawMessage(x, y, msg.text, msg.isReceived, msg.time, msg.auto);
    }

    this.ctx.restore();

    this.cycleTime += 16;
    if (this.cycleTime > this.fullCycleDuration) {
      this.cycleTime = 0;
    }

    requestAnimationFrame(this.animate);
  }
}

window.addEventListener('resize', () => {
  document.querySelectorAll('.phone-body canvas').forEach(canvas => {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  });
});