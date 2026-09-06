import { createElement } from 'lwc';
import LightningFlowScanner from 'c/lightningFlowScanner';

const ALL_SCAN_RESULTS = [
    {
        flowName: 'Flow A',
        flowApiName: 'Flow_A',
        flowId: '300A',
        scanResult: {
            ruleResults: [
                {
                    ruleName: 'UnusedVariable',
                    severity: 'warning',
                    details: [
                        { name: 'anUnusedVariable', type: 'variables', details: { dataType: 'String' } }
                    ]
                }
            ]
        }
    },
    {
        flowName: 'Flow B',
        flowApiName: 'Flow_B',
        flowId: '300B',
        scanResult: { ruleResults: [] }
    }
];

const CLEAN_SCAN_RESULTS = [
    { flowName: 'Flow A', flowApiName: 'Flow_A', flowId: '300A', scanResult: { ruleResults: [] } },
    { flowName: 'Flow B', flowApiName: 'Flow_B', flowId: '300B', scanResult: { ruleResults: [] } }
];

describe('c-lightning-flow-scanner clean scan celebration', () => {
    afterEach(() => {
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    // The spy has to be attached after the first render, so the element starts
    // with violations on screen and the clean results arrive afterwards — which
    // is also the real sequence: rescan, then celebrate.
    function buildWithSpy() {
        const element = createElement('c-lightning-flow-scanner', { is: LightningFlowScanner });
        element.allScanResults = ALL_SCAN_RESULTS;
        element.numberOfRules = 27;
        document.body.appendChild(element);
        const confetti = element.shadowRoot.querySelector('c-lfs-confetti');
        const burst = jest.spyOn(confetti, 'burst').mockImplementation(() => {});
        return { element, burst };
    }

    it('celebrates a scan that comes back clean', async () => {
        const { element, burst } = buildWithSpy();

        element.allScanResults = CLEAN_SCAN_RESULTS;
        await Promise.resolve();

        expect(burst).toHaveBeenCalledTimes(1);
        const clean = element.shadowRoot.querySelector('.clean-result');
        expect(clean.textContent).toContain('All clear!');
        expect(clean.textContent).toContain('across 2 flows');
        expect(clean.textContent).toContain('27 rules run');
    });

    it('does not replay the celebration when the same results re-render', async () => {
        const { element, burst } = buildWithSpy();

        element.allScanResults = CLEAN_SCAN_RESULTS;
        await Promise.resolve();
        element.shadowRoot.querySelectorAll('lightning-input')[0]
            .dispatchEvent(new CustomEvent('keyup', { detail: { value: 'Flow' } }));
        await Promise.resolve();

        expect(burst).toHaveBeenCalledTimes(1);
    });

    it('stays quiet while violations are on screen', async () => {
        const { burst } = buildWithSpy();

        expect(burst).not.toHaveBeenCalled();
    });

    it('celebrates again when a later scan comes back clean', async () => {
        const { element, burst } = buildWithSpy();

        element.allScanResults = CLEAN_SCAN_RESULTS;
        await Promise.resolve();
        element.allScanResults = [...CLEAN_SCAN_RESULTS];
        await Promise.resolve();

        expect(burst).toHaveBeenCalledTimes(2);
    });
});
