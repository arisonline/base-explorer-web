function getRoute() {
    const path = window.location.pathname
        .replace(/\/+$/, "");

    if (path === "" || path === "/base") {
        return {
            type: "home"
        };
    }

    let match;

    match = path.match(/^\/base\/block\/(\d+)$/);
    if (match) {
        return {
            type: "block",
            value: match[1]
        };
    }

    match = path.match(/^\/base\/tx\/(0x[a-fA-F0-9]{64})$/);
    if (match) {
        return {
            type: "tx",
            value: match[1]
        };
    }

    match = path.match(/^\/base\/address\/(0x[a-fA-F0-9]{40})$/);
    if (match) {
        return {
            type: "address",
            value: match[1]
        };
    }

    match = path.match(/^\/base\/token\/(0x[a-fA-F0-9]{40})$/);
    if (match) {
        return {
            type: "token",
            value: match[1]
        };
    }

    match = path.match(/^\/base\/contract\/(0x[a-fA-F0-9]{40})$/);
    if (match) {
        return {
            type: "contract",
            value: match[1]
        };
    }

    return {
        type: "404"
    };
}



function navigateTo(url) {
    history.pushState({}, "", url);
    window.dispatchEvent(new PopStateEvent("popstate"));
}



/* =========================================================
   BASE EXPLORER
   UNIVERSAL SITE.JS

   Universal Header
   Universal Search
   Gas Tracker
   Clean URL Routing
   ========================================================= */


/* =========================================================
   BASE RPC
   ========================================================= */

const BASE_RPC = "https://mainnet.base.org";

const EXPLORER_BASE_PATH = "/base";


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
   SHORT HASH / ADDRESS
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
   COPY BUTTON
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
   CLEAN URL ROUTES
   ========================================================= */

function goToAddress(address) {
    if (!address) return;

    navigateTo(
        EXPLORER_BASE_PATH +
        "/address/" +
        encodeURIComponent(address)
    );
}


function goToBlock(blockNumber) {
    if (!blockNumber) return;

    navigateTo(
        EXPLORER_BASE_PATH +
        "/block/" +
        encodeURIComponent(blockNumber)
    );
}


function goToTransaction(hash) {
    if (!hash) return;

    navigateTo(
        EXPLORER_BASE_PATH +
        "/tx/" +
        encodeURIComponent(hash)
    );
}


function goToToken(address) {
    if (!address) return;

    navigateTo(
        EXPLORER_BASE_PATH +
        "/token/" +
        encodeURIComponent(address)
    );
}


function goToContract(address) {
    if (!address) return;

    navigateTo(
        EXPLORER_BASE_PATH +
        "/contract/" +
        encodeURIComponent(address)
    );
}


/* =========================================================
   UNIVERSAL HEADER
   ========================================================= */

function renderSiteHeader() {

    const header =
        document.getElementById("siteHeader");


    if (!header) {
        return;
    }


    header.innerHTML = `

        <header class="site-header">

            <div class="site-header-inner">


                <!-- LOGO -->

                <a
                    href="${EXPLORER_BASE_PATH}/"
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

                    <a href="${EXPLORER_BASE_PATH}/">
                        Home
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/block/">
                        Blockchain
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/token/">
                        Tokens
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/address/">
                        Contracts
                    </a>

                </nav>


                <!-- HEADER ACTIONS -->

                <div class="header-actions">


                    <!-- SEARCH -->

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


            <!-- MOBILE NAV -->

            <div
                id="mobileNavigation"
                class="mobile-navigation"
            >

                <a href="${EXPLORER_BASE_PATH}/">
                    Home
                </a>

                <a href="${EXPLORER_BASE_PATH}/block/">
                    Blockchain
                </a>

                <a href="${EXPLORER_BASE_PATH}/token/">
                    Tokens
                </a>

                <a href="${EXPLORER_BASE_PATH}/address/">
                    Contracts
                </a>

                <button
                    type="button"
                    onclick="openGasTracker()"
                >
                    ⛽ Gas Tracker
                </button>

            </div>


            <!-- GAS TRACKER -->

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


    loadHeaderGas();

}


/* =========================================================
   UNIVERSAL FOOTER
   ========================================================= */

function renderSiteFooter() {

    const footer =
        document.getElementById("siteFooter");


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

                    <a href="${EXPLORER_BASE_PATH}/">
                        Home
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/block/">
                        Blocks
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/address/">
                        Addresses
                    </a>

                    <a href="${EXPLORER_BASE_PATH}/token/">
                        Tokens
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
   UNIVERSAL SEARCH
   ========================================================= */

async function performBlockchainSearch(input) {

    input =
        String(input || "").trim();


    if (!input) {
        return;
    }


    /* =====================================================
       TRANSACTION HASH
       ===================================================== */

    if (
        /^0x[a-fA-F0-9]{64}$/.test(input)
    ) {

        goToTransaction(input);

        return;

    }


    /* =====================================================
       BLOCK NUMBER
       ===================================================== */

    if (
        /^\d+$/.test(input)
    ) {

        goToBlock(input);

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
   ADDRESS / CONTRACT / TOKEN DETECTION
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
           NORMAL WALLET
           ================================================= */

        if (
            !code ||
            code === "0x"
        ) {

            goToAddress(address);

            return;

        }


        /* =================================================
           SMART CONTRACT
           ================================================= */

        /*
         * We keep contracts under:
         *
         * /base/address/ADDRESS
         *
         * Token detection remains separate.
         */

        const isToken =
            await checkERC20(address);


        if (isToken) {

            goToToken(address);

            return;

        }


        goToAddress(address);

    }

    catch (error) {

        console.error(
            "Address detection error:",
            error
        );


        /*
         * If RPC detection fails,
         * use the address route.
         */

        goToAddress(address);

    }

}


/* =========================================================
   ERC-20 DETECTION
   ========================================================= */

async function checkERC20(address) {

    try {

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

async function getBaseGasPrice() {

    /*
     * First try latest block baseFeePerGas.
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


    const baseFee =
        blockResult.result.baseFeePerGas;


    if (
        baseFee &&
        baseFee !== "0x0"
    ) {

        return BigInt(baseFee);

    }


    /*
     * Fallback.
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
   CLOSE GAS ON OUTSIDE CLICK
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
