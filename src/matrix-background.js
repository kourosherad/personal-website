export function setupMatrixBackground() {
  const canvas = document.createElement('canvas');
  canvas.id = 'matrix-background';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const context = canvas.getContext('2d');
  if (!context) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const symbols = '01{}[]<>/;:=+constletasyncawaitreturnfunction';
  let width = 0, height = 0, columns = [], frame = 0, previous = 0;

  function draw(time) {
    frame = 0;
    if (document.hidden || preference.matches) return;
    if (time - previous > 65) {
      previous = time;
      context.clearRect(0, 0, width, height);
      context.font = '12px monospace';
      const dark = document.documentElement.classList.contains('dark');
      columns.forEach(column => {
        column.y += column.speed;
        if (column.y - column.length * 20 > height) column.y = -20;
        for (let i = 0; i < column.length; i++) {
          const y = column.y - i * 20;
          if (y < -20 || y > height + 20) continue;
          const opacity = (1 - i / column.length) * (dark ? .22 : .15);
          context.fillStyle = `rgba(${dark ? '170,115,235' : '102,49,161'},${opacity})`;
          const index = (column.seed + i + Math.floor(time / 900)) % symbols.length;
          context.fillText(symbols[index], column.x, y);
        }
      });
    }
    frame = requestAnimationFrame(draw);
  }

  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    if (preference.matches) context.clearRect(0, 0, width, height);
    else if (!document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() {
    width = innerWidth; height = innerHeight;
    const ratio = Math.min(devicePixelRatio, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    columns = Array.from({length:Math.ceil(width / 42)}, (_, i) => ({
      x:i * 42 + 10, y:Math.random() * height,
      speed:1 + Math.random() * 2, length:8 + Math.floor(Math.random() * 14),
      seed:Math.floor(Math.random() * symbols.length),
    }));
    sync();
  }
  window.addEventListener('resize', resize, {passive:true});
  document.addEventListener('visibilitychange', sync);
  preference.addEventListener('change', sync);
  resize();
}
