document.addEventListener("DOMContentLoaded", () => {
    let mode = 'crc';

    const btnCrc = document.getElementById("btn-crc");
    const btnHamming = document.getElementById("btn-hamming");
    const polyGroup = document.getElementById("poly-group");
    const btnTransmit = document.getElementById("btn-transmit");
    const btnReceive = document.getElementById("btn-receive");

    const dataInput = document.getElementById("data-input");
    const polyInput = document.getElementById("poly-input");

    const encodedOut = document.getElementById("encoded-output");
    const channelOut = document.getElementById("channel-bits");
    const decodedOut = document.getElementById("decoded-output");
    const rcvrStatus = document.getElementById("receiver-status");
    const rcvrMsg = document.getElementById("receiver-message");
    const channelExplanation = document.getElementById("channel-explanation");
    const encodeMathSteps = document.getElementById("encode-math-steps");

    // Mode toggling
    btnCrc.addEventListener("click", () => {
        mode = 'crc';
        btnCrc.classList.add("active");
        btnHamming.classList.remove("active");
        polyGroup.classList.remove("hidden");
        resetUI();
    });

    btnHamming.addEventListener("click", () => {
        mode = 'hamming';
        btnHamming.classList.add("active");
        btnCrc.classList.remove("active");
        polyGroup.classList.add("hidden");
        resetUI();
    });

    function resetUI() {
        encodedOut.innerHTML = '';
        channelOut.innerHTML = '<span class="placeholder">Awaiting transmission...</span>';
        decodedOut.innerHTML = '';
        rcvrStatus.className = 'status-badge idle';
        rcvrStatus.innerText = 'Waiting for data...';
        rcvrMsg.innerText = '';
        btnReceive.disabled = true;

        if (channelExplanation) channelExplanation.style.display = 'none';
        if (encodeMathSteps) encodeMathSteps.innerHTML = '';
    }

    // CRC Utilities
    function xor(a, b) {
        let res = "";
        for (let i = 1; i < b.length; i++) {
            res += a[i] === b[i] ? "0" : "1";
        }
        return res;
    }

    function mod2div(dividend, divisor) {
        let pick = divisor.length;
        let tmp = dividend.slice(0, pick);
        let steps = [];

        steps.push(`<strong>Initial Dividend:</strong> <span style="color:#60a5fa; letter-spacing: 2px;">${dividend}</span>`);
        steps.push(`<strong>Divisor (Polynomial):</strong> <span style="color:#a78bfa; letter-spacing: 2px;">${divisor}</span>`);

        let stepCount = 1;
        while (pick < dividend.length) {
            if (tmp[0] === '1') {
                steps.push(`[Step ${stepCount++}] XOR: <span style="color:#60a5fa; letter-spacing: 1px">${tmp}</span> ⊕ <span style="color:#a78bfa; letter-spacing: 1px">${divisor}</span>`);
                tmp = xor(divisor, tmp) + dividend[pick];
            } else {
                tmp = xor('0'.repeat(pick), tmp) + dividend[pick];
            }
            pick++;
        }
        if (tmp[0] === '1') {
            steps.push(`[Final Step] XOR: <span style="color:#60a5fa; letter-spacing: 1px">${tmp}</span> ⊕ <span style="color:#a78bfa; letter-spacing: 1px">${divisor}</span>`);
            tmp = xor(divisor, tmp);
        } else {
            tmp = xor('0'.repeat(pick), tmp);
        }
        steps.push(`<strong>Remainder:</strong> <span style="color:#34d399; font-weight:bold; letter-spacing: 2px;">${tmp}</span>`);
        return { rem: tmp, steps: steps };
    }

    // Hamming Utilities
    function hammingEncode(data) {
        let rev = data.split('').reverse().join('');
        let r = 0; while ((1 << r) < rev.length + r + 1) r++;
        let res = [];
        let didx = 0;

        let steps = [];
        steps.push(`<strong>Data to Encode:</strong> <span style="color:#60a5fa; letter-spacing: 2px;">${data}</span> (m = ${data.length} bits)`);
        steps.push(`<strong>Parity Bits Needed (r):</strong> <span style="color:#a78bfa; font-weight:bold;">${r}</span> <em>since 2^${r} &gt;= ${data.length} + ${r} + 1</em>`);

        for (let i = 1; i <= rev.length + r; i++) {
            res[i] = ((i & (i - 1)) === 0) ? 0 : parseInt(rev[didx++]);
        }

        for (let i = 0; i < r; i++) {
            let pos = 1 << i, pval = 0;
            let checked = [];
            for (let j = 1; j < res.length; j++) {
                if (j & pos) {
                    if (j !== pos) checked.push(`<span style="color:#cbd5e1">b${j}</span>(<span style="color:#60a5fa; font-weight:bold">${res[j]}</span>)`);
                    pval ^= res[j];
                }
            }
            res[pos] = pval;
            steps.push(`<strong style="color:#a78bfa; background:rgba(139,92,246,0.2); padding: 2px 6px; border-radius: 4px;">P${pos}</strong> logic: XOR checks <span style="font-size:0.85rem">${checked.join(' ⊕ ')}</span> ➡ <strong style="color:#a78bfa">P${pos} = ${pval}</strong>`);
        }
        let cw = res.slice(1).reverse().join('');
        steps.push(`<strong>Codeword Constructed:</strong> <span class="math-accent">${cw}</span>`);
        return { cw: cw, steps: steps };
    }

    function hammingDecode(cw) {
        let arr = [0].concat(cw.split('').reverse().map(Number));
        let r = 0; while ((1 << r) <= arr.length - 1) r++;
        let errPos = 0;
        for (let i = 0; i < r; i++) {
            let pos = 1 << i, pval = 0;
            for (let j = 1; j < arr.length; j++) if (j & pos) pval ^= arr[j];
            if (pval === 1) errPos += pos;
        }
        let det = errPos !== 0;
        if (det) arr[errPos] ^= 1;
        let ext = [];
        for (let i = 1; i < arr.length; i++) if ((i & (i - 1)) !== 0) ext.push(arr[i]);
        return {
            err: det,
            data: ext.reverse().join('')
        };
    }

    function renderBits(container, binaryStr, currentMode, originalDataLen, isChannel = false) {
        container.innerHTML = '';
        const len = binaryStr.length;

        binaryStr.split('').forEach((b, idx) => {
            const span = document.createElement("span");

            let isParity = false;
            if (currentMode === 'crc') {
                if (idx >= originalDataLen) isParity = true;
            } else if (currentMode === 'hamming') {
                let origIdx = len - idx;
                if ((origIdx & (origIdx - 1)) === 0) isParity = true;
            }

            span.className = isParity ? "bit parity" : "bit data";
            span.innerText = b;

            if (!isChannel) {
                span.title = isParity ? "Parity / Redundancy Bit" : "Original Data Bit";
            }

            if (isChannel) {
                span.title = "Click to flip this bit and simulate channel error!";
                span.addEventListener("click", function () {
                    this.innerText = this.innerText === '1' ? '0' : '1';
                    this.classList.toggle('error');

                    // Highlight the receiver button as action is needed
                    btnReceive.style.boxShadow = "0 0 10px rgba(16,185,129,0.8)";
                    setTimeout(() => btnReceive.style.boxShadow = "none", 1000);
                });
            }
            container.appendChild(span);
        });
    }

    // 1. Encoding phase (Transmitter)
    btnTransmit.addEventListener("click", () => {
        resetUI();
        const data = dataInput.value.trim();
        if (!/^[01]+$/.test(data)) return alert("Data must be binary containing only 0s and 1s!");

        let codeword = "";
        let stepsHtml = "";
        if (mode === 'crc') {
            const poly = polyInput.value.trim();
            if (!/^[01]+$/.test(poly)) return alert("Polynomial must be binary!");
            const appended = data + '0'.repeat(poly.length - 1);
            const res = mod2div(appended, poly);
            codeword = data + res.rem;
            stepsHtml = res.steps.map((s, i) => `<div class="math-step" style="animation-delay: ${i * 0.08}s">${s}</div>`).join('');
        } else {
            const res = hammingEncode(data);
            codeword = res.cw;
            stepsHtml = res.steps.map((s, i) => `<div class="math-step" style="animation-delay: ${i * 0.08}s">${s}</div>`).join('');
        }

        renderBits(encodedOut, codeword, mode, data.length);

        // Render identically inside channel for processing
        renderBits(channelOut, codeword, mode, data.length, true);
        btnReceive.disabled = false;
        btnReceive.style.background = "var(--primary)";

        channelExplanation.style.display = 'block';
        encodeMathSteps.innerHTML = stepsHtml;
    });

    // 2. Decoding Phase (Receiver)
    btnReceive.addEventListener("click", () => {
        btnReceive.disabled = true;
        btnReceive.style.background = "";

        // Read string off the channel elements
        const received = Array.from(channelOut.querySelectorAll('.bit')).map(node => node.innerText).join('');

        if (mode === 'crc') {
            const poly = polyInput.value.trim();
            const res = mod2div(received, poly);
            const passed = !res.rem.includes('1');

            if (passed) {
                rcvrStatus.className = 'status-badge success';
                rcvrStatus.innerText = '✅ PASS: No Errors Detected';
                rcvrMsg.innerText = 'The CRC checksum divided perfectly with 0 remainder. The data is intact.';
                renderBits(decodedOut, received.slice(0, received.length - poly.length + 1), 'crc', received.slice(0, received.length - poly.length + 1).length);
            } else {
                rcvrStatus.className = 'status-badge fail';
                rcvrStatus.innerText = '❌ FAIL: Data Corrupted';
                rcvrMsg.innerText = 'A transmission error occurred. CRC remainder is non-zero. Frame is discarded.';
                decodedOut.innerHTML = '<span class="placeholder" style="color:var(--error)">Discarded corrupted data...</span>';
            }
        } else {
            const res = hammingDecode(received);
            if (res.err) {
                rcvrStatus.className = 'status-badge fail';
                rcvrStatus.innerText = '⚠️ Error Detected & Corrected';
                rcvrMsg.innerText = 'Hamming correctly identified and reversed the tampered bit.';
            } else {
                rcvrStatus.className = 'status-badge success';
                rcvrStatus.innerText = '✅ PASS: Data Intact';
                rcvrMsg.innerText = 'The codeword was delivered cleanly.';
            }
            renderBits(decodedOut, res.data, 'crc', res.data.length); // Render pure data as 'crc' mode so it defaults to pure data blue
        }
    });

    // Run Initial State
    resetUI();
});
