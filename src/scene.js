import * as THREE from 'three';
import anime from 'animejs/lib/anime.es.js';

export function mountScene(host) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' }); }
  catch { host.classList.add('scene-fallback'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8.7);
  scene.add(new THREE.AmbientLight(0xaaaaff, 2));
  const light = new THREE.PointLight(0xb58aff, 65); light.position.set(3, 4, 4); scene.add(light);
  const rim = new THREE.PointLight(0x77f5df, 35); rim.position.set(-4, -2, 2); scene.add(rim);
  const assembly = new THREE.Group(); scene.add(assembly);
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.12, 1), new THREE.MeshStandardMaterial({ color: 0x6940bf, metalness: .8, roughness: .25, flatShading: true }));
  assembly.add(core);
  core.add(new THREE.LineSegments(new THREE.EdgesGeometry(core.geometry), new THREE.LineBasicMaterial({ color: 0xd9baff, transparent: true, opacity: .65 })));
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.8 + i * .28, .012, 8, 120), new THREE.MeshBasicMaterial({ color: i === 1 ? 0x94e9d9 : 0x9d6feb, transparent: true, opacity: .65 }));
    ring.rotation.set(.6 + i * .65, i * .7, .4); assembly.add(ring); rings.push(ring);
  }
  const nodes = [];
  for (let i = 0; i < 32; i++) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(.14,.14,.14), new THREE.MeshStandardMaterial({color: i % 4 ? 0xb68bea : 0x9bffe4, metalness:.5,roughness:.25}));
    assembly.add(mesh); nodes.push(mesh);
  }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function mode(value) {
    nodes.forEach((node, i) => {
      const a = i / 32 * Math.PI * 2;
      const target = value === 'code' ? {x: (i%4-1.5)*.58,y:(Math.floor(i/4)-3.5)*.43,z:1.5}
        : value === 'model' ? {x:Math.cos(a)*2.5,y:Math.sin(a)*2.5,z:Math.sin(a*3)*.4}
        : {x:Math.cos(a)* (i%2 ? 2.2:2.8),y:Math.sin(a*3)*1.9,z:Math.sin(a)*1.5};
      anime.remove(node.position);
      anime({targets:node.position,...target,duration:reduced.matches?0:1100,delay:reduced.matches?0:i*12,easing:'easeInOutCubic',update:()=>{if(reduced.matches) renderer.render(scene,camera);}});
    });
    document.querySelectorAll('[data-scene-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sceneMode===value)));
  }
  document.querySelectorAll('[data-scene-mode]').forEach(b=>b.addEventListener('click',()=>mode(b.dataset.sceneMode)));
  mode('model');
  let pointerX=0,pointerY=0,visible=true;
  host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width-.5;pointerY=(e.clientY-r.top)/r.height-.5;});
  host.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;});
  function resize(){ const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();renderer.render(scene,camera); }
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  function frame(time){assembly.rotation.y+= (pointerX*.5-assembly.rotation.y)*.035;assembly.rotation.x+= (pointerY*.3-assembly.rotation.x)*.035;core.rotation.y=time*.00016;core.rotation.z=time*.00008;rings[0].rotation.z=time*.00009;renderer.render(scene,camera);}
  function sync(){renderer.setAnimationLoop(visible&&!document.hidden&&!reduced.matches?frame:null);renderer.render(scene,camera);}
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(host);
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();renderer.setAnimationLoop(null);host.classList.add('scene-fallback');});
  resize();sync();
}
