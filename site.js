/* =========================================================
   BASE EXPLORER
   UNIVERSAL SITE.JS

   Step 7  → Universal Search
   Step 8  → Gas Tracker
   ========================================================= */


/* =========================================================
   BASE RPC
   ========================================================= */

const BASE_RPC = "https://mainnet.base.org";


async function baseRPC(method, params = []) {

    const response = await fetch(BASE_RPC, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            jsonrpc: "2.0",

            id: 1,

            method: method,

            params: params

        })

    });


    if (!response.ok) {
        throw new Error("Base RPC request failed");
    }


    const data = await response.json();


    if (data.error) {
        throw new Error(
            data.error.message || "RPC error"
        );
    }


    return data;

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   SHORT ADDRESS / HASH
   ========================================================= */

function shortHash(value, start = 8, end = 6) {

    if (!value) {
        return "-";
    }


    const text = String(value);


    if (text.length <= start + end + 3) {
        return text;
    }


    return (
        text.slice(0, start) +
        "..." +
        text.slice(-end)
    );

}


/* =========================================================
   ONE-TAP COPY
   ========================================================= */

async function copyText(value, button = null) {

    if (!value) {
        return;
    }


    try {

        await navigator.clipboard.writeText(value);


        if (button) {

            const original =
                button.innerHTML;

            button.innerHTML = "✓";


            setTimeout(function() {

                button.innerHTML = original;

            }, 1200);

        }

    }

    catch (error) {

        console.error(
            "Copy failed:",
            error
        );


        /* Fallback */

        const textarea =
            document.createElement("textarea");

        textarea.value = value;

        textarea.style.position = "fixed";
        textarea.style.opacity = "0";

        document.body.appendChild(textarea);

        textarea.select();

        document.execCommand("copy");

        textarea.remove();


        if (button) {

            const original =
                button.innerHTML;

            button.innerHTML = "✓";


            setTimeout(function() {

                button.innerHTML = original;

            }, 1200);

        }

    }

}


/* =========================================================
   UNIVERSAL COPY BUTTON HTML
   ========================================================= */

function copyButton(value) {

    const safeValue =
        escapeHTML(value);


    return `

        <button
            type="button"
            class="copy-button"
            title="Copy"
            onclick="copyText('${safeValue}', this)"
        >
            ⧉
        </button>

    `;

}


/* =========================================================
   UNIVERSAL HEADER
   ========================================================= */

function renderSiteHeader() {

    const header =
        document.getElementById(
            "siteHeader"
        );


    if (!header) {
        return;
    }


    header.innerHTML = `

        <header class="site-header">

            <div class="site-header-inner">


                <!-- LOGO -->

                <a
                    href="index.html"
                    class="site-logo"
                >

                    <span class="site-logo-icon">
                        B
                    </span>

                    <span>
                        Base Explorer
                    </span>

                </a>


                <!-- DESKTOP NAV -->

                <nav class="site-nav">

                    <a href="index.html">
                        Home
                    </a>

                    <a href="block.html">
                        Blockchain
                    </a>

                    <a href="token.html">
                        Tokens
                    </a>

                    <a href="contract.html">
                        Contracts
                    </a>

                </nav>


                <!-- HEADER ACTIONS -->

                <div class="header-actions">


                    <!-- UNIVERSAL SEARCH -->

                    <div class="header-search">

                        <span class="search-icon">
                            ⌕
                        </span>


                        <input
                            type="text"
                            id="headerSearchInput"
                            placeholder="Search address, tx, block..."
                            autocomplete="off"
                            spellcheck="false"
                        >


                        <button
                            type="button"
                            onclick="searchFromHeader()"
                        >
                            Search
                        </button>

                    </div>


                    <!-- GAS -->

                    <button
                        type="button"
                        class="gas-header-button"
                        onclick="openGasTracker()"
                        title="Base Gas Tracker"
                    >

                        <span>
                            ⛽
                        </span>

                        <span id="headerGasValue">
                            Gas
                        </span>

                    </button>


                    <!-- MOBILE MENU -->

                    <button
                        class="mobile-menu-button"
                        type="button"
                        onclick="toggleMobileMenu()"
                        aria-label="Open menu"
                    >
                        ☰
                    </button>


                </div>

            </div>


            <!-- MOBILE NAVIGATION -->

            <div
                id="mobileNavigation"
                class="mobile-navigation"
            >

                <a href="index.html">
                    Home
                </a>

                <a href="block.html">
                    Blockchain
                </a>

                <a href="token.html">
                    Tokens
                </a>

                <a href="contract.html">
                    Contracts
                </a>

                <button
                    type="button"
                    onclick="openGasTracker()"
                >
                    ⛽ Gas Tracker
                </button>

            </div>


            <!-- GAS PANEL -->

            <div
                id="gasTrackerPanel"
                class="gas-tracker-panel"
            >

                <div class="gas-tracker-card">


                    <div class="gas-tracker-header">

                        <div>

                            <strong>
                                Base Gas Tracker
                            </strong>

                            <span>
                                Live Base Mainnet RPC
                            </span>

                        </div>


                        <button
                            type="button"
                            class="gas-close"
                            onclick="closeGasTracker()"
                        >
                            ×
                        </button>

                    </div>


                    <div
                        id="gasTrackerContent"
                        class="gas-tracker-content"
                    >

                        <div class="gas-loading">
                            Loading gas...
                        </div>

                    </div>


                    <div class="gas-tracker-footer">

                        <span id="gasUpdated">
                            Not updated
                        </span>


                        <button
                            type="button"
                            onclick="loadGasTracker()"
                        >
                            ↻ Refresh
                        </button>

                    </div>


                </div>

            </div>

        </header>

    `;


    /* =====================================================
       SEARCH ENTER KEY
       ===================================================== */

    const input =
        document.getElementById(
            "headerSearchInput"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchFromHeader();

                }

            }
        );

    }


    /* =====================================================
       OPTIONAL: LOAD SMALL GAS PRICE
       ===================================================== */

    loadHeaderGas();

}


/* =========================================================
   UNIVERSAL FOOTER
   ========================================================= */

function renderSiteFooter() {

    const footer =
        document.getElementById(
            "siteFooter"
        );


    if (!footer) {
        return;
    }


    footer.innerHTML = `

        <footer class="site-footer">


            <div class="footer-inner">


                <div class="footer-brand">

                    <div class="footer-logo">

                        <span class="site-logo-icon">
                            B
                        </span>

                        <strong>
                            Base Explorer
                        </strong>

                    </div>


                    <p>
                        Explore the Base Mainnet blockchain.
                    </p>

                </div>


                <div class="footer-column">

                    <h3>
                        Explorer
                    </h3>

                    <a href="index.html">
                        Home
                    </a>

                    <a href="block.html">
                        Blocks
                    </a>

                    <a href="#">
                        Transactions
                    </a>

                    <a href="address.html">
                        Addresses
                    </a>

                </div>


                <div class="footer-column">

                    <h3>
                        Tokens
                    </h3>

                    <a href="token.html">
                        Tokens
                    </a>

                    <a href="#">
                        Token Transfers
                    </a>

                    <a href="#">
                        Token Holders
                    </a>

                </div>


                <div class="footer-column">

                    <h3>
                        Network
                    </h3>

                    <a
                        href="https://base.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Base
                    </a>


                    <a
                        href="https://basescan.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        BaseScan
                    </a>


                    <div class="footer-network">
                        Base Mainnet
                    </div>


                    <div class="footer-network">
                        Chain ID: 8453
                    </div>

                </div>


            </div>


            <div class="footer-bottom">

                <span>
                    Base Explorer © 2026
                </span>

                <span>
                    Built for Base Mainnet
                </span>

            </div>


        </footer>

    `;

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById(
            "mobileNavigation"
        );


    if (!menu) {
        return;
    }


    menu.classList.toggle("show");

}


/* =========================================================
   CLOSE MOBILE MENU
   ========================================================= */

function closeMobileMenu() {

    const menu =
        document.getElementById(
            "mobileNavigation"
        );


    if (!menu) {
        return;
    }


    menu.classList.remove("show");

}


/* =========================================================
   HEADER SEARCH
   ========================================================= */

async function searchFromHeader() {

    const input =
        document.getElementById(
            "headerSearchInput"
        );


    if (!input) {
        return;
    }


    const value =
        input.value.trim();


    if (!value) {

        input.focus();

        return;

    }


    input.disabled = true;


    try {

        await performBlockchainSearch(value);

    }

    finally {

        input.disabled = false;

    }

}


/* =========================================================
   UNIVERSAL BLOCKCHAIN SEARCH
   ========================================================= */

async function performBlockchainSearch(input) {

    input =
        String(input || "").trim();


    if (!input) {

        alert(
            "Please enter an address, transaction hash, block number or token address."
        );

        return;

    }


    /* =====================================================
       TRANSACTION HASH
       ===================================================== */

    if (
        /^0x[a-fA-F0-9]{64}$/.test(input)
    ) {

        window.location.href =
            "tx.html?hash=" +
            encodeURIComponent(input);

        return;

    }


    /* =====================================================
       BLOCK NUMBER
       ===================================================== */

    if (
        /^\d+$/.test(input)
    ) {

        window.location.href =
            "block.html?block=" +
            encodeURIComponent(input);

        return;

    }


    /* =====================================================
       ADDRESS / CONTRACT / TOKEN
       ===================================================== */

    if (
        /^0x[a-fA-F0-9]{40}$/.test(input)
    ) {

        await detectAddressOrToken(input);

        return;

    }


    alert(
        "Invalid search. Enter a valid address, transaction hash or block number."
    );

}


/* =========================================================
   ADDRESS / TOKEN / CONTRACT DETECTION
   ========================================================= */

async function detectAddressOrToken(address) {

    try {

        const codeResult =
            await baseRPC(
                "eth_getCode",
                [
                    address,
                    "latest"
                ]
            );


        const code =
            codeResult.result;


        /* =================================================
           NORMAL WALLET / EOA
           ================================================= */

        if (
            !code ||
            code === "0x"
        ) {

            window.location.href =
                "address.html?address=" +
                encodeURIComponent(address);

            return;

        }


        /* =================================================
           SMART CONTRACT
           ================================================= */

        const isToken =
            await checkERC20(address);


        if (isToken) {

            window.location.href =
                "token.html?address=" +
                encodeURIComponent(address);

            return;

        }


        /* =================================================
           NORMAL CONTRACT
           ================================================= */

        window.location.href =
            "contract.html?address=" +
            encodeURIComponent(address);

    }

    catch (error) {

        console.error(
            "Address detection error:",
            error
        );


        /*
         * If RPC detection fails,
         * send it to address page.
         */

        window.location.href =
            "address.html?address=" +
            encodeURIComponent(address);

    }

}


/* =========================================================
   ERC-20 DETECTION
   ========================================================= */

async function checkERC20(address) {

    try {

        /* symbol() */

        const symbolResult =
            await baseRPC(
                "eth_call",
                [
                    {
                        to: address,
                        data: "0x95d89b41"
                    },
                    "latest"
                ]
            );


        /* decimals() */

        const decimalsResult =
            await baseRPC(
                "eth_call",
                [
                    {
                        to: address,
                        data: "0x313ce567"
                    },
                    "latest"
                ]
            );


        if (
            !symbolResult.result ||
            symbolResult.result === "0x"
        ) {

            return false;

        }


        if (
            !decimalsResult.result ||
            decimalsResult.result === "0x"
        ) {

            return false;

        }


        return true;

    }

    catch (error) {

        console.error(
            "ERC-20 detection failed:",
            error
        );


        return false;

    }

}


/* =========================================================
   GAS TRACKER
   ========================================================= */


/*
 * Base gas tracker uses:
 *
 * eth_gasPrice
 *
 * This returns the current gas price
 * suggested by the Base RPC.
 */


async function getBaseGasPrice() {

    /*
     * Get latest Base block.
     */

    const blockResult =
        await baseRPC(
            "eth_getBlockByNumber",
            [
                "latest",
                false
            ]
        );


    if (
        !blockResult.result
    ) {

        throw new Error(
            "Latest block unavailable"
        );

    }


    /*
     * Base EIP-1559 blocks contain
     * baseFeePerGas.
     */

    const baseFee =
        blockResult.result.baseFeePerGas;


    if (
        baseFee &&
        baseFee !== "0x0"
    ) {

        return BigInt(baseFee);

    }


    /*
     * Fallback to eth_gasPrice.
     */

    const gasResult =
        await baseRPC(
            "eth_gasPrice"
        );


    if (
        !gasResult.result ||
        gasResult.result === "0x0"
    ) {

        throw new Error(
            "Gas price unavailable"
        );

    }


    return BigInt(
        gasResult.result
    );

}

/* =========================================================
   WEI → GWEI
   ========================================================= */

function weiToGwei(wei) {

    const base =
        1000000000n;


    const whole =
        wei / base;


    const remainder =
        wei % base;


    /*
     * Keep 6 decimal places so
     * small Base gas prices are visible.
     */

    const decimal =
        remainder
            .toString()
            .padStart(9, "0")
            .slice(0, 6);


    return (
        whole.toString() +
        "." +
        decimal
    );

}


/* =========================================================
   LOAD HEADER GAS
   ========================================================= */

async function loadHeaderGas() {

    const element =
        document.getElementById(
            "headerGasValue"
        );


    if (!element) {
        return;
    }


    try {

        const gas =
            await getBaseGasPrice();


        element.textContent =
            weiToGwei(gas) + " Gwei";

    }

    catch (error) {

        console.error(
            "Header gas error:",
            error
        );


        element.textContent =
            "Gas";

    }

}


/* =========================================================
   OPEN GAS TRACKER
   ========================================================= */

async function openGasTracker() {

    const panel =
        document.getElementById(
            "gasTrackerPanel"
        );


    if (!panel) {
        return;
    }


    panel.classList.add("show");


    await loadGasTracker();

}


/* =========================================================
   CLOSE GAS TRACKER
   ========================================================= */

function closeGasTracker() {

    const panel =
        document.getElementById(
            "gasTrackerPanel"
        );


    if (!panel) {
        return;
    }


    panel.classList.remove("show");

}


/* =========================================================
   LOAD GAS TRACKER
   ========================================================= */

async function loadGasTracker() {

    const content =
        document.getElementById(
            "gasTrackerContent"
        );


    const updated =
        document.getElementById(
            "gasUpdated"
        );


    if (!content) {
        return;
    }


    content.innerHTML = `

        <div class="gas-loading">
            Loading current Base gas...
        </div>

    `;


    try {

        const gas =
            await getBaseGasPrice();


        const gwei =
            weiToGwei(gas);


        content.innerHTML = `

            <div class="gas-main">

                <span class="gas-label">
                    Current Gas Price
                </span>

                <strong>
                    ${escapeHTML(gwei)}
                    <small>Gwei</small>
                </strong>

            </div>


            <div class="gas-info-grid">

                <div class="gas-info-item">

                    <span>
                        Network
                    </span>

                    <strong>
                        Base Mainnet
                    </strong>

                </div>


                <div class="gas-info-item">

                    <span>
                        Chain ID
                    </span>

                    <strong>
                        8453
                    </strong>

                </div>


                <div class="gas-info-item">

                    <span>
                        Gas Price
                    </span>

                    <strong>
                        ${escapeHTML(gwei)} Gwei
                    </strong>

                </div>


                <div class="gas-info-item">

                    <span>
                        Source
                    </span>

                    <strong>
                        Base RPC
                    </strong>

                </div>

            </div>

        `;


        if (updated) {

            updated.textContent =
                "Updated just now";

        }


    }

    catch (error) {

        console.error(
            "Gas tracker error:",
            error
        );


        content.innerHTML = `

            <div class="gas-error">

                Unable to load current gas price.

                <button
                    type="button"
                    onclick="loadGasTracker()"
                >
                    Try again
                </button>

            </div>

        `;


        if (updated) {

            updated.textContent =
                "Update failed";

        }

    }

}


/* =========================================================
   CLOSE GAS WHEN CLICKING OUTSIDE
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const panel =
            document.getElementById(
                "gasTrackerPanel"
            );


        const button =
            event.target.closest(
                ".gas-header-button"
            );


        if (
            panel &&
            panel.classList.contains("show") &&
            !panel.contains(event.target) &&
            !button
        ) {

            closeGasTracker();

        }

    }
);


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderSiteHeader();

        renderSiteFooter();

    }
);
