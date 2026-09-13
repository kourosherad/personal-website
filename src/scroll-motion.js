import anime from 'animejs/lib/anime.es.js';
import './scroll-motion.css';

const source = [
  '// An idea, turned into something real.',
  'const developer = {',
  '  name: "Kourosh",',
  '  tools: ["JavaScript", "Three.js"],',
  '  mindset: "Keep building"',
  '};',
  '',
  'async function build(idea) {',
  '  const design = await imagine(idea);',
  '  const product = await develop(design);',
  '  return deploy(product);',
  '}',
  '',
  'build("Your next possibility");',
].join('\n');

export function setupScrollMotion() {
  const skills = document.getElementById('skills');
  const editor = document.createElement('div');
  editor.className = 'code-performance';
  editor.dir = 'ltr';
  editor.innerHTML = '<div class="code-toolbar"><span class="code-dots" aria-hidden="true">● ● ●</span><span>possibility.js</span><span>JavaScript</span></div><pre class="code-screen" aria-hidden="true"><code></code><span class="code-cursor">▍</span></pre><pre class="sr-only"></pre><div class="code-status"><span>// scroll to write · اسکرول کن تا کد نوشته شود</span><span class="code-percent">0%</span></div>';
  editor.querySelector('.sr-only').textContent = source;
  skills.appendChild(editor);
  const code = editor.querySelector('code');
  const tokens = source.match(/\/\/[^\n]*|"[^"\n]*"|\b(?:const|async|function|await|return)\b|\b\d+\b|[^\w\s]|\s+|\w+/g) || [];
  const fragments = tokens.map(text => {
    const span = document.createElement('span');
    span.className = text.startsWith('//') ? 'syntax-comment' : text.startsWith('"') ? 'syntax-string' : /^(const|async|function|await|return)$/.test(text) ? 'syntax-keyword' : 'syntax-base';
    code.appendChild(span);
    return {span,text};
  });
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const animated = [];
  const recipes = {
    about: { translateX:[-35,0], rotate:[-2,0] },
    skills: { translateY:[45,0], scale:[.9,1] },
    experience: { translateX:[35,0], scaleX:[.95,1] },
    projects: { translateY:[60,0], rotateX:[12,0], scale:[.94,1] },
    services: { translateY:[35,0], rotate:[3,0] },
    contact: { translateY:[45,0], scale:[.95,1] },
  };
  document.querySelectorAll('main > section').forEach(section => {
    const elements = section.querySelectorAll('.reveal:not(.reveal-group), .r-child');
    elements.forEach(el => {
      el.classList.add('scroll-animated');
      const animation = anime({targets:el,...recipes[section.id],opacity:[.25,1],duration:1000,easing:'easeOutCubic',autoplay:false});
      animated.push({el,animation});
    });
  });
  let scheduled = false;
  let lastCount = -1;
  const clamp = value => Math.max(0, Math.min(1,value));
  function writeCode(progress) {
    const count = Math.round(source.length * progress);
    if (count === lastCount) return;
    lastCount = count;
    let remaining = count;
    fragments.forEach(({span,text}) => {span.textContent = text.slice(0,Math.max(0,remaining));remaining -= text.length;});
    editor.querySelector('.code-percent').textContent = `${Math.round(progress*100)}%`;
  }
  function update() {
    scheduled = false;
    const reduced = preference.matches;
    animated.forEach(({el,animation}) => {
      if (el.closest('[hidden]')) return;
      const top = el.getBoundingClientRect().top;
      const progress = reduced ? 1 : clamp((innerHeight*.96-top)/(innerHeight*.4));
      animation.seek(progress*animation.duration);
    });
    const rect = editor.getBoundingClientRect();
    writeCode(reduced ? 1 : clamp((innerHeight*.95-rect.top)/(Math.min(rect.height,innerHeight)*.85)));
    document.querySelectorAll('main > section').forEach(section => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--section-progress',reduced ? 1 : clamp((innerHeight-rect.top)/(rect.height+innerHeight*.35)));
    });
  }
  function schedule() { if (!scheduled) { scheduled=true;requestAnimationFrame(update); } }
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule);
  preference.addEventListener('change',schedule);
  new ResizeObserver(schedule).observe(document.querySelector('main'));
  window.addEventListener('beforeprint',()=>{animated.forEach(({animation})=>animation.seek(animation.duration));writeCode(1);});
  window.addEventListener('afterprint',schedule);
  update();
}
