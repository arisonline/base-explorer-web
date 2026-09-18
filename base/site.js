async function renderHome(app) {

    app.innerHTML = `

        <section class="hero">

            <div class="hero-inner">

                <div class="hero-badge">

                    <span class="status-dot"></span>

                    Base Mainnet

                    <span>•</span>

                    Chain ID 8453

                </div>


                <h1>
                    Explore Base
                </h1>


                <p>
                    Search Base Mainnet blocks, transactions,
                    addresses, tokens and smart contracts.
                </p>


                <div class="hero-search">

                    <input
                        type="text"
                        id="heroSearchInput"
                        placeholder="Search by address, transaction hash or block number..."
                        autocomplete="off"
                    >

                    <button
                        type="button"
                        onclick="searchFromHero()"
                    >
                        Search
                    </button>

                </div>


                <div class="hero-network">

                    <strong>
                        ● Base Mainnet
                    </strong>

                    &nbsp;•&nbsp;

                    Ethereum-compatible L2

                </div>

            </div>

        </section>


        <main class="container">

            <section class="stats">


                <div class="stat-card">

                    <div class="stat-top">

                        <div class="stat-title">
                            Latest Block
                        </div>

                        <div class="stat-icon">
                            #
                        </div>

                    </div>

                    <div
                        class="stat-value"
                        id="latestBlock"
                    >
                        Loading...
                    </div>

                    <div class="stat-sub">
                        Base Mainnet
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-top">

                        <div class="stat-title">
                            Network
                        </div>

                        <div class="stat-icon">
                            B
                        </div>

                    </div>

                    <div class="stat-value">
                        Base Mainnet
                    </div>

                    <div class="stat-sub">
                        Ethereum Layer 2
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-top">

                        <div class="stat-title">
                            Chain ID
                        </div>

                        <div class="stat-icon">
                            8453
                        </div>

                    </div>

                    <div class="stat-value">
                        8453
                    </div>

                    <div class="stat-sub">
                        Base Mainnet
                    </div>

                </div>


            </section>


            <section class="content">

                <div class="columns">


                    <div class="card">

                        <div class="card-header">

                            <h2>
                                Latest Blocks
                            </h2>

                            <a
                                href="/base/block/"
                                class="view-all"
                            >
                                View all
                            </a>

                        </div>


                        <div
                            class="list"
                            id="latestBlocksList"
                        >

                            <div class="loading-item">
                                Loading latest blocks...
                            </div>

                        </div>

                    </div>


                    <div class="card">

                        <div class="card-header">

                            <h2>
                                Latest Transactions
                            </h2>

                            <a
                                href="#"
                                class="view-all"
                            >
                                View all
                            </a>

                        </div>


                        <div
                            class="list"
                            id="latestTransactionsList"
                        >

                            <div class="loading-item">
                                Loading latest transactions...
                            </div>

                        </div>

                    </div>


                </div>

            </section>

        </main>

    `;


    initializeHomePage();

}






function initializeHomePage() {

    const heroInput =
        document.getElementById(
            "heroSearchInput"
        );

    if (heroInput) {

        heroInput.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    searchFromHero();

                }

            }
        );

    }


    loadLatestBlock();

    loadLatestBlocks();

    loadLatestTransactions();

}




/* =========================================================
   HERO SEARCH
   ========================================================= */

function searchFromHero() {

    const input =
        document.getElementById(
            "heroSearchInput"
        );


    if (!input) {
        return;
    }


    performBlockchainSearch(
        input.value.trim()
    );

}


document
    .getElementById("heroSearchInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                searchFromHero();

            }

        }
    );


/* =========================================================
   LOAD LATEST BLOCK
   ========================================================= */

async function loadLatestBlock() {

    try {

        const result =
            await baseRPC(
                "eth_blockNumber"
            );


        if (!result.result) {

            throw new Error(
                "Unable to get latest block"
            );

        }


        const blockNumber =
            parseInt(
                result.result,
                16
            );


        document.getElementById(
            "latestBlock"
        ).textContent =
            blockNumber.toLocaleString();

    }

    catch (error) {

        console.error(
            "Latest block error:",
            error
        );


        document.getElementById(
            "latestBlock"
        ).textContent =
            "Unavailable";

    }

}


/* =========================================================
   LOAD LATEST BLOCKS
   Uses blocks 2-6 behind chain tip
   ========================================================= */

async function loadLatestBlocks() {

    try {

        const latestResult =
            await baseRPC(
                "eth_blockNumber"
            );


        if (!latestResult.result) {

            throw new Error(
                "Unable to get latest block"
            );

        }


        const latestBlock =
            parseInt(
                latestResult.result,
                16
            );


        const blocks = [];


        for (
            let i = 2;
            i <= 6;
            i++
        ) {

            const blockNumber =
                latestBlock - i;


            if (blockNumber < 0) {
                continue;
            }


            const blockResult =
                await baseRPC(
                    "eth_getBlockByNumber",
                    [
                        "0x" +
                        blockNumber.toString(16),
                        false
                    ]
                );


            if (blockResult.result) {

                blocks.push(
                    blockResult.result
                );

            }

        }


        renderLatestBlocks(
            blocks
        );

    }

    catch (error) {

        console.error(
            "Latest blocks error:",
            error
        );


        document.getElementById(
            "latestBlocksList"
        ).innerHTML = `

            <div class="loading-item">

                Unable to load blocks.
                Please refresh the page.

            </div>

        `;

    }

}


/* =========================================================
   LOAD LATEST TRANSACTIONS
   Uses blocks 2-6 behind chain tip
   ========================================================= */

async function loadLatestTransactions() {

    try {

        const latestResult =
            await baseRPC(
                "eth_blockNumber"
            );


        if (!latestResult.result) {

            throw new Error(
                "Unable to get latest block"
            );

        }


        const latestBlock =
            parseInt(
                latestResult.result,
                16
            );


        const transactions = [];


        for (
            let i = 2;
            i <= 6;
            i++
        ) {

            if (
                transactions.length >= 5
            ) {

                break;

            }


            const blockNumber =
                latestBlock - i;


            if (blockNumber < 0) {
                continue;
            }


            const blockResult =
                await baseRPC(
                    "eth_getBlockByNumber",
                    [
                        "0x" +
                        blockNumber.toString(16),
                        true
                    ]
                );


            const block =
                blockResult.result;


            if (
                !block ||
                !block.transactions
            ) {

                continue;

            }


            transactions.push(
                ...block.transactions
            );

        }


        renderLatestTransactions(
            transactions.slice(0, 5)
        );

    }

    catch (error) {

        console.error(
            "Latest transactions error:",
            error
        );


        document.getElementById(
            "latestTransactionsList"
        ).innerHTML = `

            <div class="loading-item">

                Unable to load transactions.
                Please refresh the page.

            </div>

        `;

    }

}


/* =========================================================
   RENDER LATEST BLOCKS
   ========================================================= */

function renderLatestBlocks(blocks) {

    const container =
        document.getElementById(
            "latestBlocksList"
        );


    if (
        !blocks ||
        blocks.length === 0
    ) {

        container.innerHTML = `

            <div class="loading-item">

                No blocks found.

            </div>

        `;

        return;

    }


    container.innerHTML =
        blocks.map(
            block => {

                const blockNumber =
                    parseInt(
                        block.number,
                        16
                    );


                const transactionCount =
                    block.transactions
                        ? block.transactions.length
                        : 0;


                const timestamp =
                    parseInt(
                        block.timestamp,
                        16
                    );


                const date =
                    new Date(
                        timestamp * 1000
                    );


                return `

                    <div
                        class="list-item clickable"
                        onclick="openBlock(${blockNumber})"
                    >

                        <div class="item-main">

                            <div class="item-title">

                                Block
                                #${blockNumber.toLocaleString()}

                            </div>


                            <div class="item-sub">

                                ${transactionCount}
                                transaction${transactionCount !== 1 ? "s" : ""}
                                •
                                ${date.toLocaleTimeString()}

                            </div>

                        </div>


                        <div class="item-value">

                            ${transactionCount}
                            txns

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   RENDER LATEST TRANSACTIONS
   ========================================================= */

function renderLatestTransactions(
    transactions
) {

    const container =
        document.getElementById(
            "latestTransactionsList"
        );


    if (
        !transactions ||
        transactions.length === 0
    ) {

        container.innerHTML = `

            <div class="loading-item">

                No transactions found.

            </div>

        `;

        return;

    }


    container.innerHTML =
        transactions.map(
            tx => {

                const hash =
                    tx.hash || "";


                const blockNumber =
                    tx.blockNumber
                        ? parseInt(
                            tx.blockNumber,
                            16
                        )
                        : 0;


                const value =
                    tx.value || "0";


                return `

                    <div
                        class="list-item clickable"
                        onclick="openTransaction('${hash}')"
                    >

                        <div class="item-main">

                            <div class="item-title">

                                ${shortHash(hash)}

                            </div>


                            <div class="item-sub">

                                Block
                                ${blockNumber.toLocaleString()}

                            </div>

                        </div>


                        <div class="item-value">

                            ${formatEthValue(value)}
                            ETH

                        </div>

                    </div>

                `;

            }
        ).join("");

}


/* =========================================================
   SHORT TRANSACTION HASH
   ========================================================= */

function shortHash(hash) {

    if (!hash) {
        return "0x...";
    }


    return (
        hash.substring(0, 10) +
        "..." +
        hash.substring(
            hash.length - 8
        )
    );

}


/* =========================================================
   FORMAT ETH VALUE
   ========================================================= */

function formatEthValue(value) {

    try {

        const wei =
            BigInt(value);


        const whole =
            wei /
            1000000000000000000n;


        const fraction =
            wei %
            1000000000000000000n;


        const fractionText =
            fraction
                .toString()
                .padStart(18, "0")
                .substring(0, 6);


        return (
            whole.toString() +
            "." +
            fractionText
        );

    }

    catch {

        return "0.000000";

    }

}


/* =========================================================
   OPEN TRANSACTION
   ========================================================= */

function openTransaction(hash) {

    if (!hash) {
        return;
    }

    goToTransaction(hash);

}


/* =========================================================
   OPEN BLOCK
   ========================================================= */

function openBlock(blockNumber) {

    if (!blockNumber) {
        return;
    }

    goToBlock(blockNumber);

}




async function renderBlock(app, blockNumber) {

    app.innerHTML = `
        <main class="container">

            <div class="breadcrumb">
                <a href="/base/">Home</a>
                /
                Block
            </div>

            <div id="blockContainer">

                <div class="loading">
                    Loading block...
                </div>

            </div>

        </main>
    `;

    loadBlockPage(blockNumber);
}




const BLOCKSCOUT_API = "https://base.blockscout.com/api/v2";


function isValidBlock(value) {

    return /^\d+$/.test(value || "");

}


function formatNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "-";
    }

    try {

        return Number(value).toLocaleString();

    } catch {

        return String(value);

    }

}


function formatGwei(value) {

    try {

        const wei = BigInt(value || "0");

        const whole = wei / 1000000000n;

        const fraction = wei % 1000000000n;

        const fractionText =
            fraction
                .toString()
                .padStart(9, "0")
                .substring(0, 6);

        return whole.toString() +
            "." +
            fractionText +
            " Gwei";

    } catch {

        return "-";

    }

}


function formatETH(value) {

    try {

        const wei = BigInt(value || "0");

        const whole =
            wei / 1000000000000000000n;

        const fraction =
            wei % 1000000000000000000n;

        const fractionText =
            fraction
                .toString()
                .padStart(18, "0")
                .substring(0, 6);

        return whole.toString() +
            "." +
            fractionText +
            " ETH";

    } catch {

        return "0.000000 ETH";

    }

}





async function loadBlockPage(blockNumber) {

    const container =
        document.getElementById("blockContainer");

    if (!container) {
        return;
    }

    /* Validate block number */

    if (!isValidBlock(blockNumber)) {

        container.innerHTML = `
            <div class="error">
                Invalid block number.
            </div>
        `;

        return;
    }

    /* Loading state */

    container.innerHTML = `
        <div class="loading">
            Loading block #${escapeHTML(blockNumber)}...
        </div>
    `;

    try {

        const response =
            await fetch(
                BLOCKSCOUT_API +
                "/blocks/" +
                encodeURIComponent(blockNumber)
            );

        if (!response.ok) {

            throw new Error(
                "Block not found"
            );

        }

        const block =
            await response.json();

        displayBlockPage(
            block,
            blockNumber
        );

    } catch (error) {

        console.error(
            "Block loading error:",
            error
        );

        container.innerHTML = `
            <div class="error">

                Unable to load this block.

                <br><br>

                Please check the block number
                and try again.

            </div>
        `;

    }

}




function displayBlockPage(block, blockNumber) {

    const container =
        document.getElementById("blockContainer");

    if (!container) {
        return;
    }

    const height =
        block.height ??
        block.number ??
        blockNumber;

    const timestamp =
        block.timestamp
            ? new Date(
                block.timestamp
            ).toLocaleString()
            : "-";

    const blockHash =
        block.hash || "-";

    const parentHash =
        block.parent_hash || "-";

    const miner =
        block.miner?.hash || "";

    const gasUsed =
        block.gas_used ?? 0;

    const gasLimit =
        block.gas_limit ?? 0;

    const transactionCount =
        block.transaction_count ??
        block.tx_count ??
        0;

    const baseFee =
        block.base_fee_per_gas
            ? formatGwei(
                block.base_fee_per_gas
            )
            : "-";

    container.innerHTML = `

        <div class="card">

            <div class="card-header">

                <span>
                    Block Details
                </span>

                <span class="network-badge">
                    ● Base Mainnet
                </span>

            </div>

            <div class="card-body">

                <div class="block-label">
                    Block
                </div>

                <div class="block-number">
                    #${formatNumber(height)}
                </div>

            </div>

            <div class="details">

                <div class="detail-label">
                    Block Hash
                </div>

                <div class="detail-value hash">
                    ${escapeHTML(blockHash)}
                </div>

                <div class="detail-label">
                    Parent Hash
                </div>

                <div class="detail-value hash">
                    ${escapeHTML(parentHash)}
                </div>

                <div class="detail-label">
                    Timestamp
                </div>

                <div class="detail-value">
                    ${escapeHTML(timestamp)}
                </div>

                <div class="detail-label">
                    Validator / Miner
                </div>

                <div class="detail-value">

                    ${
                        miner
                            ? `
                                <a
                                    href="/base/address/${encodeURIComponent(miner)}"
                                >
                                    ${shortHash(miner)}
                                </a>
                            `
                            : "-"
                    }

                </div>

                <div class="detail-label">
                    Transactions
                </div>

                <div class="detail-value">
                    ${formatNumber(transactionCount)}
                </div>

                <div class="detail-label">
                    Gas Used
                </div>

                <div class="detail-value">
                    ${formatNumber(gasUsed)}
                </div>

                <div class="detail-label">
                    Gas Limit
                </div>

                <div class="detail-value">
                    ${formatNumber(gasLimit)}
                </div>

                <div class="detail-label">
                    Base Fee
                </div>

                <div class="detail-value">
                    ${escapeHTML(baseFee)}
                </div>

            </div>

        </div>


        <div class="card">

            <div class="card-header">

                <span>
                    Transactions
                </span>

                <span style="
                    color:#9ca3af;
                    font-size:11px;
                    font-weight:500;
                ">
                    ${formatNumber(transactionCount)} total
                </span>

            </div>

            <div id="transactions">

                <div class="loading">
                    Loading transactions...
                </div>

            </div>

        </div>


        <div class="card">

            <div class="card-header">
                Explorer Links
            </div>

            <div class="card-body">

                <a
                    class="external-link"
                    href="https://basescan.org/block/${encodeURIComponent(blockNumber)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    View on BaseScan →
                </a>

            </div>

        </div>

    `;

    loadBlockTransactionsPage(blockNumber);
}








async function loadBlockTransactionsPage(blockNumber) {

    const container =
        document.getElementById("transactions");

    if (!container) {
        return;
    }

    try {

        const response =
            await fetch(
                BLOCKSCOUT_API +
                "/blocks/" +
                encodeURIComponent(blockNumber) +
                "/transactions"
            );

        if (!response.ok) {
            throw new Error(
                "Transactions unavailable"
            );
        }

        const data =
            await response.json();

        const transactions =
            data.items || [];

        if (transactions.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    No transactions found.
                </div>
            `;

            return;
        }

        let html = `

            <div class="table-wrapper">

                <table>

                    <thead>

                        <tr>

                            <th>Transaction</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Value</th>
                            <th>Status</th>

                        </tr>

                    </thead>

                    <tbody>

        `;

        transactions.forEach(tx => {

            const hash =
                tx.hash || "";

            const from =
                tx.from?.hash || "";

            const to =
                tx.to?.hash || "";

            const value =
                formatETH(tx.value);

            const isSuccess =
                tx.status === "ok";

            const status =
                isSuccess
                    ? "Success"
                    : "Failed";

            html += `

                <tr>

                    <td>

                        ${
                            hash
                                ? `
                                    <a
                                        href="/base/tx/${encodeURIComponent(hash)}"
                                        title="${escapeHTML(hash)}"
                                    >
                                        ${shortHash(hash)}
                                    </a>
                                `
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            from
                                ? `
                                    <a
                                        href="/base/address/${encodeURIComponent(from)}"
                                        title="${escapeHTML(from)}"
                                    >
                                        ${shortHash(from)}
                                    </a>
                                `
                                : "-"
                        }

                    </td>

                    <td>

                        ${
                            to
                                ? `
                                    <a
                                        href="/base/address/${encodeURIComponent(to)}"
                                        title="${escapeHTML(to)}"
                                    >
                                        ${shortHash(to)}
                                    </a>
                                `
                                : "-"
                        }

                    </td>

                    <td>
                        ${escapeHTML(value)}
                    </td>

                    <td>

                        <span
                            class="${
                                isSuccess
                                    ? "status"
                                    : "status failed"
                            }"
                        >
                            ${status}
                        </span>

                    </td>

                </tr>

            `;

        });

        html += `

                    </tbody>

                </table>

            </div>

        `;

        container.innerHTML = html;

    } catch (error) {

        console.error(
            "Block transactions error:",
            error
        );

        container.innerHTML = `
            <div class="empty">

                Unable to load block transactions.

                <br><br>

                Please try again later.

            </div>
        `;
    }
}






function renderTransaction(app, hash) {
    app.innerHTML = `
        <section class="page-container">
            <h1>Transaction</h1>
            <p>${escapeHTML(hash)}</p>
        </section>
    `;
}

function renderAddress(app, address) {
    app.innerHTML = `
        <section class="page-container">
            <h1>Address</h1>
            <p>${escapeHTML(address)}</p>
        </section>
    `;
}

function renderToken(app, address) {
    app.innerHTML = `
        <section class="page-container">
            <h1>Token</h1>
            <p>${escapeHTML(address)}</p>
        </section>
    `;
}

function renderContract(app, address) {
    app.innerHTML = `
        <section class="page-container">
            <h1>Contract</h1>
            <p>${escapeHTML(address)}</p>
        </section>
    `;
}

function renderNotFound(app) {
    app.innerHTML = `
        <section class="page-container">
            <h1>404</h1>
            <p>Page not found.</p>
        </section>
    `;
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




/* =========================================================
   BASE EXPLORER ROUTER
   ========================================================= */

function getRoute() {

    let path = window.location.pathname;

    path = path.replace(/\/+$/, "");


    /* HOME */

    if (
        path === "" ||
        path === "/base"
    ) {
        return {
            type: "home"
        };
    }


    /* BLOCK */

    let match = path.match(
        /^\/base\/block\/(\d+)$/
    );

    if (match) {

        return {
            type: "block",
            value: match[1]
        };

    }


    /* TRANSACTION */

    match = path.match(
        /^\/base\/tx\/(0x[a-fA-F0-9]{64})$/
    );

    if (match) {

        return {
            type: "tx",
            value: match[1]
        };

    }


    /* ADDRESS */

    match = path.match(
        /^\/base\/address\/(0x[a-fA-F0-9]{40})$/
    );

    if (match) {

        return {
            type: "address",
            value: match[1]
        };

    }


    /* TOKEN */

    match = path.match(
        /^\/base\/token\/(0x[a-fA-F0-9]{40})$/
    );

    if (match) {

        return {
            type: "token",
            value: match[1]
        };

    }


    /* CONTRACT */

    match = path.match(
        /^\/base\/contract\/(0x[a-fA-F0-9]{40})$/
    );

    if (match) {

        return {
            type: "contract",
            value: match[1]
        };

    }


    /* UNKNOWN */

    return {
        type: "404"
    };

}


/* =========================================================
   SPA NAVIGATION
   ========================================================= */


function navigateTo(url) {

    if (!url) {
        return;
    }

    const currentURL =
        window.location.pathname +
        window.location.search;

    if (currentURL === url) {
        return;
    }

    history.pushState(
        {},
        "",
        url
    );

    renderRoute();

}


/* =========================================================
   ROUTE HELPERS
   ========================================================= */

function goToHome() {

    navigateTo(
        EXPLORER_BASE_PATH + "/"
    );

}


function goToAddress(address) {

    if (!address) {
        return;
    }


    navigateTo(
        EXPLORER_BASE_PATH +
        "/address/" +
        encodeURIComponent(address)
    );

}


function goToBlock(blockNumber) {

    if (
        blockNumber === undefined ||
        blockNumber === null ||
        blockNumber === ""
    ) {
        return;
    }


    navigateTo(
        EXPLORER_BASE_PATH +
        "/block/" +
        encodeURIComponent(blockNumber)
    );

}


function goToTransaction(hash) {

    if (!hash) {
        return;
    }


    navigateTo(
        EXPLORER_BASE_PATH +
        "/tx/" +
        encodeURIComponent(hash)
    );

}


function goToToken(address) {

    if (!address) {
        return;
    }


    navigateTo(
        EXPLORER_BASE_PATH +
        "/token/" +
        encodeURIComponent(address)
    );

}


function goToContract(address) {

    if (!address) {
        return;
    }


    navigateTo(
        EXPLORER_BASE_PATH +
        "/contract/" +
        encodeURIComponent(address)
    );

}


/* =========================================================
   BROWSER BACK / FORWARD
   ========================================================= */

window.addEventListener(
    "popstate",
    function() {

        renderRoute();

    }
);




/* =========================================================
   INTERNAL LINK ROUTING
   ========================================================= */

document.addEventListener(
    "click",
    function(event) {

        const link =
            event.target.closest("a");

        if (!link) {
            return;
        }


        /* Allow Ctrl/Cmd/Shift/Alt clicks */

        if (
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return;
        }


        /* Allow new-tab links */

        if (
            link.target === "_blank"
        ) {
            return;
        }


        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }


        /* Only Base Explorer links */

        if (
            !href.startsWith(
                EXPLORER_BASE_PATH
            )
        ) {
            return;
        }


        event.preventDefault();

        navigateTo(href);

    }
);




/* =========================================================
   ROUTE RENDERER
   TEST VERSION
   ========================================================= */

async function renderRoute() {
    const route = getRoute();
    const app = document.getElementById("app");

    if (!app) return;

    switch (route.type) {
        case "home":
            await renderHome(app);
            break;

        case "block":
            await renderBlock(app, route.value);
            break;

        case "tx":
            await renderTransaction(app, route.value);
            break;

        case "address":
            await renderAddress(app, route.value);
            break;

        case "token":
            await renderToken(app, route.value);
            break;

        case "contract":
            await renderContract(app, route.value);
            break;

        default:
            renderNotFound(app);
    }
}




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

        renderRoute();

    }
);
