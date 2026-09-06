import { LightningElement, api } from "lwc";

// A clean scan is the whole point of the tool, so it gets a celebration rather
// than a line of green text. Salesforce's own confetti is Path "Celebrations",
// which is declarative and Path-only — there is no base component to reuse — so
// the burst is drawn here on a canvas. No library: a static resource would have
// to ship in the managed package for ~80 lines of animation.
const PIECE_COUNT = 150;
const DURATION_MS = 2800;
const GRAVITY = 900; // px/s^2
const DRAG = 0.55; // per second, applied to horizontal drift
const COLORS = ["#0176d3", "#04844b", "#fe9339", "#e5195e", "#9050e9", "#ffd426"];

export default class LfsConfetti extends LightningElement {
    _canvas = null;
    _ctx = null;
    _pieces = [];
    _frame = null;
    _lastTs = null;
    _elapsed = 0;

    // Imperative rather than reactive: the parent fires this when a scan comes
    // back clean, and a re-render (sorting, filtering) must not replay it.
    @api
    burst() {
        if (this.reducedMotion) return;
        const canvas = this._resolveCanvas();
        if (!canvas) return;

        this._pieces = this._createPieces(canvas.clientWidth || 800, canvas.clientHeight || 400);
        this._elapsed = 0;
        this._lastTs = null;
        if (this._frame === null) {
            // The rule guards against loops outliving the component; this one is
            // cancelled in disconnectedCallback and stops itself after DURATION_MS.
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this._frame = requestAnimationFrame(this._tick);
        }
    }

    // Someone who has asked the OS to stop animations gets the static clean
    // state instead — the message is in the markup, not in the confetti.
    get reducedMotion() {
        return (
            typeof window.matchMedia === "function" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
    }

    disconnectedCallback() {
        this._stop();
    }

    _resolveCanvas() {
        if (!this._canvas) {
            this._canvas = this.template.querySelector("canvas");
        }
        if (!this._canvas || typeof this._canvas.getContext !== "function") return null;
        if (!this._ctx) {
            this._ctx = this._canvas.getContext("2d");
        }
        return this._ctx ? this._canvas : null;
    }

    _createPieces(width, height) {
        const pieces = [];
        for (let i = 0; i < PIECE_COUNT; i++) {
            // Two launchers, bottom corners, angled inward — the shape of the
            // Salesforce celebration rather than a top-down snowfall.
            const fromLeft = i % 2 === 0;
            const spread = (Math.random() - 0.5) * 0.9;
            pieces.push({
                x: fromLeft ? width * 0.08 : width * 0.92,
                y: height,
                // Tuned to arc inside the results panel rather than fly out of
                // the top of it — the panel is only a few hundred pixels tall.
                vx: (fromLeft ? 1 : -1) * (260 + Math.random() * 460) + spread * 160,
                vy: -(430 + Math.random() * 420),
                size: 6 + Math.random() * 7,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 12,
                color: COLORS[i % COLORS.length],
                round: i % 5 === 0
            });
        }
        return pieces;
    }

    _tick = (ts) => {
        const canvas = this._resolveCanvas();
        if (!canvas) {
            this._stop();
            return;
        }

        // First frame has no previous timestamp to measure against; clamp the
        // rest so a backgrounded tab does not resume with one huge step.
        const dt = this._lastTs === null ? 0 : Math.min((ts - this._lastTs) / 1000, 0.05);
        this._lastTs = ts;
        this._elapsed += dt * 1000;

        const width = canvas.clientWidth || 0;
        const height = canvas.clientHeight || 0;
        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const ctx = this._ctx;
        ctx.clearRect(0, 0, width, height);

        const fade = Math.max(0, 1 - this._elapsed / DURATION_MS);
        for (const p of this._pieces) {
            p.vy += GRAVITY * dt;
            p.vx -= p.vx * DRAG * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;

            ctx.save();
            ctx.globalAlpha = fade;
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            if (p.round) {
                ctx.beginPath();
                ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }
            ctx.restore();
        }

        if (this._elapsed >= DURATION_MS) {
            ctx.clearRect(0, 0, width, height);
            this._stop();
            return;
        }
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this._frame = requestAnimationFrame(this._tick);
    };

    _stop() {
        if (this._frame !== null) {
            cancelAnimationFrame(this._frame);
            this._frame = null;
        }
        this._pieces = [];
    }
}
