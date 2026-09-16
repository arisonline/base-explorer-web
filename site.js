/* =========================================================
   BASE EXPLORER - UNIVERSAL SITE LAYOUT
   Header + Search + Footer
   ========================================================= */

const BASE_RPC = "https://mainnet.base.org";


/* =========================================================
   BASE RPC
   ========================================================= */

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
        throw new Error("RPC request failed");
    }

    return await response.json();
}


/* =========================================================
   UNIVERSAL HEADER
   ========================================================= */

function renderSiteHeader() {

    const header = document.getElementById("siteHeader");

    if (!header) {
        return;
    }

    header.innerHTML = `

        <header class="site-header">

            <div class="site-header-inner">

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


                <div class="header-actions">

                    <div class="header-search">

                        <span class="search-icon">
                            ⌕
                        </span>

                        <input
                            type="text"
                            id="headerSearchInput"
                            placeholder="Search address, tx, block..."
                            autocomplete="off"
                        >

                        <button
                            type="button"
                            onclick="searchFromHeader()"
                        >
                            Search
                        </button>

                    </div>


                    <button
                        class="mobile-menu-button"
                        type="button"
                        onclick="toggleMobileMenu()"
                    >
                        ☰
                    </button>

                </div>

            </div>


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

            </div>

        </header>

    `;

    const input =
        document.getElementById("headerSearchInput");

    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {
                    searchFromHeader();
                }

            }
        );

    }

}


/* =========================================================
   UNIVERSAL FOOTER
   ========================================================= */

function renderSiteFooter() {

    const footer = document.getElementById("siteFooter");

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
                        rel="noopener"
                    >
                        Base
                    </a>

                    <a
                        href="https://basescan.org/"
                        target="_blank"
                        rel="noopener"
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

    await performBlockchainSearch(value);

}


/* =========================================================
   COMMON BLOCKCHAIN SEARCH
   ========================================================= */

async function performBlockchainSearch(input) {

    if (!input) {

        alert(
            "Please enter an address, transaction hash, block number or token address."
        );

        return;

    }


    /* Transaction hash */

    if (
        /^0x[a-fA-F0-9]{64}$/.test(input)
    ) {

        window.location.href =
            "tx.html?hash=" +
            encodeURIComponent(input);

        return;

    }


    /* Block number */

    if (
        /^\d+$/.test(input)
    ) {

        window.location.href =
            "block.html?block=" +
            encodeURIComponent(input);

        return;

    }


    /* Address / Contract / Token */

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


        /* Normal wallet */

        if (
            !code ||
            code === "0x"
        ) {

            window.location.href =
                "address.html?address=" +
                encodeURIComponent(address);

            return;

        }


        /* Smart contract */

        const isToken =
            await checkERC20(address);


        if (isToken) {

            window.location.href =
                "token.html?address=" +
                encodeURIComponent(address);

            return;

        }


        /* Other contract */

        window.location.href =
            "contract.html?address=" +
            encodeURIComponent(address);

    }

    catch (error) {

        console.error(
            "Address detection error:",
            error
        );

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
   INITIALIZE UNIVERSAL LAYOUT
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        renderSiteHeader();

        renderSiteFooter();

    }
);
