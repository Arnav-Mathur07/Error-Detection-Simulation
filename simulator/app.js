/* ================================================================
   app.js  —  Shared state, algorithms, page transitions
   ================================================================ */

// ── State (sessionStorage) ────────────────────────────────────────
const State = {
    get mode() { return sessionStorage.getItem('mode') || 'crc'; },
    set mode(v) { sessionStorage.setItem('mode', v); },
    get parity() { return sessionStorage.getItem('parity') || 'even'; },
    set parity(v) { sessionStorage.setItem('parity', v); },
    get data() { return sessionStorage.getItem('data') || ''; },
    set data(v) { sessionStorage.setItem('data', v); },
    get poly() { return sessionStorage.getItem('poly') || ''; },
    set poly(v) { sessionStorage.setItem('poly', v); },
    get codeword() { return sessionStorage.getItem('codeword') || ''; },
    set codeword(v) { sessionStorage.setItem('codeword', v); },
    get received() { return sessionStorage.getItem('received') || ''; },
    set received(v) { sessionStorage.setItem('received', v); },
    get fromChannel() { return sessionStorage.getItem('fromChannel') === '1'; },
    set fromChannel(v) { sessionStorage.setItem('fromChannel', v ? '1' : '0'); },
};

// ── Navigation with transition ────────────────────────────────────
function navigate(url) {
    const root = document.querySelector('.page-root');
    if (root) {
        root.classList.add('page-exit');
        setTimeout(() => { window.location.href = url; }, 330);
    } else {
        window.location.href = url;
    }
}

// ── Nav strip builder ─────────────────────────────────────────────
function buildNav(activePage) {
    const pages = [
        { label: 'Home', url: 'index.html' },
        { label: 'Transmit', url: 'transmit.html' },
        { label: 'Channel', url: 'channel.html' },
        { label: 'Explanation', url: 'explanation.html' },
        { label: 'Receiver', url: 'receiver.html' },
    ];
    const order = pages.map(p => p.url);
    const activeIdx = order.indexOf(activePage);
    const nav = document.querySelector('.nav-steps');
    if (!nav) return;
    nav.innerHTML = pages.map((p, i) => {
        let cls = 'nav-step';
        if (p.url === activePage) cls += ' active';
        else if (i < activeIdx) cls += ' done';
        // Explanation only via Channel; disable direct nav
        if (p.url === 'explanation.html') {
            return `<span class="nav-step" style="opacity:.3; cursor:not-allowed">${p.label}</span>`;
        }
        return `<a href="#" class="${cls}" onclick="navigate('${p.url}');return false;">${p.label}</a>`;
    }).join('');
}

// ── CRC Utilities ─────────────────────────────────────────────────
function xorBits(a, b) {
    let r = '';
    for (let i = 1; i < b.length; i++) r += a[i] === b[i] ? '0' : '1';
    return r;
}

// Returns { rem, steps[] }  steps = [{dividend, divisor, xored, bring, active}]
function crcEncode(data, poly) {
    const appended = data + '0'.repeat(poly.length - 1);
    const { rem, steps } = mod2div(appended, poly);
    return { codeword: data + rem, rem, steps };
}

function mod2div(dividend, divisor) {
    let pick = divisor.length;
    let tmp = dividend.slice(0, pick);
    const steps = [];
    while (pick <= dividend.length) {
        const step = { dividend: tmp, divisor };
        if (tmp[0] === '1') {
            step.xored = xorBits(divisor, tmp);
            step.quotient = '1';
        } else {
            step.xored = xorBits('0'.repeat(pick), tmp);
            step.quotient = '0';
        }
        if (pick < dividend.length) {
            step.bring = step.xored + dividend[pick];
            tmp = step.bring;
        } else {
            step.bring = step.xored;
            tmp = step.xored;
        }
        steps.push(step);
        pick++;
    }
    return { rem: tmp.padStart(divisor.length - 1, '0'), steps };
}

function crcCheck(received, poly) {
    const { rem, steps } = mod2div(received, poly);
    const pass = !rem.replace(/0/g, '');
    return { pass, rem, steps };
}

// ── Hamming Utilities ────────────────────────────────────────────
function numParityBits(m) {
    let r = 0;
    while ((1 << r) < m + r + 1) r++;
    return r;
}

// Returns { codeword, r, n, positions[], bits[], parityCalcs[] }
function hammingEncode(data, parity = 'even') {
    const m = data.length;
    const r = numParityBits(m);
    const n = m + r;
    const bits = new Array(n + 1).fill(0);
    let di = m - 1; // Read data from right-to-left
    for (let i = 1; i <= n; i++) {
        if ((i & (i - 1)) !== 0) bits[i] = parseInt(data[di--]);
    }
    const parityCalcs = [];
    for (let p = 0; p < r; p++) {
        const pos = 1 << p;
        let val = 0;
        const covers = [];
        for (let i = 1; i <= n; i++) {
            if (i !== pos && (i & pos)) { covers.push(i); val ^= bits[i]; }
        }
        if (parity === 'odd') val ^= 1;
        bits[pos] = val;
        parityCalcs.push({ pos, covers, val });
    }
    const positions = [];
    for (let i = n; i >= 1; i--) positions.push({ idx: i, isParity: (i & (i - 1)) === 0 });
    let codeword = '';
    for (let i = n; i >= 1; i--) codeword += bits[i];
    return { codeword, r, n, positions, bits, parityCalcs };
}

// Returns { err, errPos, correctedCodeword, extractedData, syndromeCalcs[] }
function hammingDecode(received, parity = 'even') {
    const n = received.length;
    const arr = [0];
    for (let i = n - 1; i >= 0; i--) arr.push(parseInt(received[i])); // pos 1 to N

    let r = 0; while ((1 << r) <= n) r++;
    let errPos = 0;
    const syndromeCalcs = [];
    for (let p = 0; p < r; p++) {
        const pos = 1 << p;
        let val = 0;
        const covers = [];
        for (let i = 1; i <= n; i++) { if (i & pos) { covers.push(i); val ^= arr[i]; } }
        const s = parity === 'odd' ? (val === 0 ? 1 : 0) : val;
        if (s) errPos += pos;
        syndromeCalcs.push({ pos, covers, val, syndrome: s });
    }
    const correctedBits = [...arr];
    const err = errPos > 0 && errPos <= n;
    if (err) correctedBits[errPos] ^= 1;
    let extractedData = '';
    for (let i = n; i >= 1; i--) {
        if ((i & (i - 1)) !== 0) extractedData += correctedBits[i];
    }
    let correctedCodeword = '';
    for (let i = n; i >= 1; i--) correctedCodeword += correctedBits[i];
    return { err, errPos, correctedCodeword, extractedData, syndromeCalcs };
}

// ── Bit Box Helper ────────────────────────────────────────────────
function makeBitBox(bit, cls = 'data', label = '', delay = 0) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;align-items:center;';
    const box = document.createElement('div');
    box.className = `bit-box ${cls} flow-in`;
    box.style.animationDelay = delay + 's';
    box.textContent = bit;
    wrap.appendChild(box);
    if (label) {
        const lbl = document.createElement('div');
        lbl.className = 'bit-label';
        lbl.textContent = label;
        wrap.appendChild(lbl);
    }
    return { wrap, box };
}

function renderBitRow(container, bits, classMap = {}, labelMap = {}) {
    container.innerHTML = '';
    bits.split('').forEach((b, i) => {
        const cls = classMap[i] || 'data';
        const label = labelMap[i] || '';
        const { wrap } = makeBitBox(b, cls, label, i * 0.035);
        container.appendChild(wrap);
    });
}
