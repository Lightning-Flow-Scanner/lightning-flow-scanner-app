import { createElement } from 'lwc';
import LfsConfetti from 'c/lfsConfetti';

// jsdom's canvas has no 2d context, so the drawing calls are recorded through a
// stub. What matters here is the lifecycle: does a burst start, does it stop,
// and does it stay silent when the user has asked for reduced motion.
function stubCanvas(element) {
    const ctx = {
        clearRect: jest.fn(), save: jest.fn(), restore: jest.fn(), translate: jest.fn(),
        rotate: jest.fn(), fillRect: jest.fn(), beginPath: jest.fn(), arc: jest.fn(), fill: jest.fn()
    };
    const canvas = element.shadowRoot.querySelector('canvas');
    canvas.getContext = jest.fn(() => ctx);
    Object.defineProperty(canvas, 'clientWidth', { value: 800, configurable: true });
    Object.defineProperty(canvas, 'clientHeight', { value: 400, configurable: true });
    return ctx;
}

function setReducedMotion(reduce) {
    window.matchMedia = jest.fn(() => ({ matches: reduce }));
}

describe('c-lfs-confetti', () => {
    let frames;

    beforeEach(() => {
        frames = [];
        jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
            frames.push(cb);
            return frames.length;
        });
        jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
        setReducedMotion(false);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    function build() {
        const element = createElement('c-lfs-confetti', { is: LfsConfetti });
        document.body.appendChild(element);
        return element;
    }

    it('draws nothing until a burst is requested', () => {
        const element = build();
        stubCanvas(element);
        expect(frames).toHaveLength(0);
    });

    it('animates a burst and clears itself when the run is over', () => {
        const element = build();
        const ctx = stubCanvas(element);

        element.burst();
        expect(frames).toHaveLength(1);

        frames[0](0);
        expect(ctx.fillRect.mock.calls.length + ctx.arc.mock.calls.length).toBeGreaterThan(0);

        // Drive it to the end: the loop must stop on its own and wipe the
        // canvas, so a clean scan does not leave a rAF loop running forever.
        let ts = 0;
        let guard = 0;
        while (frames.length && guard < 500) {
            const next = frames.pop();
            frames.length = 0;
            ts += 33;
            next(ts);
            guard++;
        }
        expect(guard).toBeLessThan(500);
        expect(frames).toHaveLength(0);
        expect(ctx.clearRect).toHaveBeenCalled();
    });

    it('stays still when the user prefers reduced motion', () => {
        setReducedMotion(true);
        const element = build();
        stubCanvas(element);

        element.burst();
        expect(frames).toHaveLength(0);
    });
});
