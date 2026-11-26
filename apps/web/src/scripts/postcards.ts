/**
 * Postcards from the garden: moves the homepage review postcards slowly along an arc.
 *
 * Speed and battery: transforms + opacity only (compositor), one requestAnimationFrame loop
 * that runs only while the section is on screen and the tab is visible. It eases to a stop on
 * hover, keyboard focus, touch or the pause button, and never auto-moves with
 * prefers-reduced-motion (arrows, dots and swipe still work). Without JS the cards stay a
 * plain swipe row (see .pc-* in global.css).
 */

const SPEED = 0.16; // cards per second while drifting
const TWEEN_MS = 650;

export function initPostcards(root: HTMLElement) {
  const stage = root.querySelector<HTMLElement>("[data-pc-stage]");
  const track = stage?.querySelector<HTMLElement>(".pc-track");
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-pc-card]"));
  const controls = root.querySelector<HTMLElement>("[data-pc-controls]");
  const dots = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-pc-dot]"));
  const toggle = root.querySelector<HTMLButtonElement>("[data-pc-toggle]");
  if (!stage || !track || cards.length < 3 || !controls || !toggle) return;

  const n = cards.length;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pos = 0;
  let velocity = 0;
  let spacing = 300;
  let curve = 18;
  let near = -1;
  let userPaused = reduce.matches;
  let hovering = false;
  let focused = false;
  let onScreen = false;
  let raf = 0;
  let last = 0;
  let tween: { from: number; to: number; t0: number } | null = null;
  let drag: { x: number; y: number; pos: number; id: number; moved: boolean } | null = null;

  stage.classList.add("is-curved");
  controls.hidden = false;

  const wrap = (d: number) => {
    let x = (((d % n) + n) % n) as number;
    if (x > n / 2) x -= n;
    return x;
  };

  function measure() {
    const w = cards[0].offsetWidth || 320;
    const narrow = window.innerWidth < 640;
    spacing = w * (narrow ? 0.94 : 0.9);
    curve = w / (narrow ? 26 : 19);
    const tallest = Math.max(...cards.map((c) => c.offsetHeight));
    // Room for the centre card plus the dip of its neighbours (they sit mostly off screen on phones).
    const dip = (narrow ? 1.2 : 2.2) ** 2 * curve;
    track!.style.setProperty("--pc-h", `${Math.ceil(tallest + dip + 16)}px`);
    render();
  }

  function render() {
    for (let i = 0; i < n; i++) {
      const d = wrap(i - pos);
      const ad = Math.abs(d);
      const el = cards[i];
      el.style.transform = `translate3d(${(d * spacing).toFixed(1)}px,${(d * d * curve).toFixed(1)}px,0) rotate(${(d * 6).toFixed(2)}deg) scale(${(1 - Math.min(ad, 3) * 0.06).toFixed(3)})`;
      el.style.opacity = Math.max(0, Math.min(1, 3.6 - ad)).toFixed(3);
      el.style.zIndex = String(100 - Math.round(ad * 10));
      el.style.setProperty("--pc-dim", (Math.min(ad, 3) * 0.12).toFixed(3));
    }
    const k = ((Math.round(pos) % n) + n) % n;
    if (k !== near) {
      near = k;
      cards.forEach((c, i) => {
        const off = i !== k;
        c.toggleAttribute("inert", off);
        c.setAttribute("aria-hidden", String(off));
      });
      dots.forEach((d, i) => d.setAttribute("aria-current", String(i === k)));
    }
  }

  const drifting = () => !userPaused && !reduce.matches && !hovering && !focused && !drag;

  function frame(t: number) {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (tween) {
      const k = Math.min(1, (t - tween.t0) / TWEEN_MS);
      pos = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - k, 3));
      if (k >= 1) tween = null;
    } else if (!drag) {
      velocity += ((drifting() ? SPEED : 0) - velocity) * Math.min(1, dt * 3);
      pos += velocity * dt;
    }
    render();
    const idle = !tween && !drag && Math.abs(velocity) < 0.0005 && !drifting();
    raf = onScreen && !document.hidden && !idle ? requestAnimationFrame(frame) : 0;
  }

  function wake() {
    if (!raf && onScreen && !document.hidden) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }

  function goTo(target: number) {
    velocity = 0;
    tween = { from: pos, to: target, t0: performance.now() };
    wake();
  }

  function setPaused(p: boolean) {
    userPaused = p;
    toggle!.setAttribute("aria-pressed", String(p));
    toggle!.setAttribute("aria-label", p ? "Play the postcards" : "Pause the postcards");
    toggle!.querySelector("[data-pc-icon-pause]")?.classList.toggle("hidden", p);
    toggle!.querySelector("[data-pc-icon-play]")?.classList.toggle("hidden", !p);
    wake();
  }

  root.querySelector("[data-pc-prev]")?.addEventListener("click", () => goTo(Math.round(pos) - 1));
  root.querySelector("[data-pc-next]")?.addEventListener("click", () => goTo(Math.round(pos) + 1));
  dots.forEach((d, i) => d.addEventListener("click", () => goTo(pos + wrap(i - pos))));
  toggle.addEventListener("click", () => {
    setPaused(!userPaused);
    if (userPaused) goTo(Math.round(pos)); // settle on a whole card
  });

  stage.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") hovering = true;
  });
  stage.addEventListener("pointerleave", () => {
    hovering = false;
    wake();
  });
  root.addEventListener("focusin", () => (focused = true));
  root.addEventListener("focusout", (e) => {
    if (!root.contains(e.relatedTarget as Node | null)) {
      focused = false;
      wake();
    }
  });

  // Swipe / drag: horizontal moves the arc, vertical still scrolls the page (touch-action: pan-y).
  track.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    tween = null;
    drag = { x: e.clientX, y: e.clientY, pos, id: e.pointerId, moved: false };
  });
  track.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved) {
      if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
      drag.moved = true;
      stage.classList.add("is-dragging");
      track.setPointerCapture(e.pointerId);
    }
    pos = drag.pos - dx / spacing;
    velocity = 0;
    render();
  });
  const endDrag = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved;
    const dx = e.clientX - drag.x;
    drag = null;
    stage.classList.remove("is-dragging");
    if (moved) goTo(Math.round(pos - Math.sign(dx) * 0.25));
    else wake();
  };
  track.addEventListener("pointerup", endDrag);
  track.addEventListener("pointercancel", endDrag);

  // Photos wait in <noscript> until the section is ~600px away, then load (keeps page load lean).
  const photos = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      photos.disconnect();
      root.querySelectorAll<HTMLElement>("noscript[data-pc-photo]").forEach((ns) => {
        ns.insertAdjacentHTML("afterend", ns.textContent ?? "");
        ns.remove();
      });
      requestAnimationFrame(measure);
    },
    { rootMargin: "600px 0px" },
  );
  photos.observe(root);

  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) wake();
    },
    { rootMargin: "100px" },
  ).observe(root);
  document.addEventListener("visibilitychange", wake);
  reduce.addEventListener("change", () => setPaused(reduce.matches || userPaused));
  new ResizeObserver(measure).observe(track);
  window.addEventListener("load", measure, { once: true });

  setPaused(userPaused);
  measure();
}
