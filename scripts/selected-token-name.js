const MODULE_ID = "selected-token-name";
const PLACEHOLDER = "{{selectedTokenName}}";

function getActorTokenName(actor) {
    if (!actor) return null;

    if (actor.isToken && actor.token) {
        return actor.token.name ?? actor.name;
    }

    const tokens = actor.getActiveTokens();

    if (tokens.length === 1) {
        return tokens[0].document?.name
            ?? tokens[0].name
            ?? actor.name;
    }

    return actor.name;
}

function getItemSheetTokenName(app) {
    const actor = app.item?.parent ?? app.actor;
    return getActorTokenName(actor);
}

function getChatTokenName(message) {
    const speaker = message.speaker;

    if (speaker?.token) {
        const sceneId = speaker.scene ?? canvas.scene?.id;
        const scene = game.scenes.get(sceneId);
        const token = scene?.tokens.get(speaker.token);

        if (token) return token.name;
    }

    const actor = speaker?.actor
        ? game.actors.get(speaker.actor)
        : null;

    return actor?.name ?? null;
}

function replacePlaceholderInElement(element, tokenName) {
    if (!element || !tokenName) return;

    const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT
    );

    const textNodes = [];
    let node;

    while ((node = walker.nextNode())) {
        if (node.nodeValue.includes(PLACEHOLDER)) {
            textNodes.push(node);
        }
    }

    for (const textNode of textNodes) {
        textNode.nodeValue = textNode.nodeValue
            .split(PLACEHOLDER)
            .join(tokenName);
    }
}

Hooks.on("renderItemSheet", (app, html) => {
    const tokenName = getItemSheetTokenName(app);
    if (!tokenName) return;

    const root = html?.[0] ?? html;
    if (!root) return;

    for (const element of root.querySelectorAll(".editor-content")) {
        replacePlaceholderInElement(element, tokenName);
    }
});

Hooks.on("renderChatMessage", (message, html) => {
    const tokenName = getChatTokenName(message);
    if (!tokenName) return;

    const root = html?.[0] ?? html;
    if (!root) return;

    replacePlaceholderInElement(root, tokenName);
});

Hooks.on("renderActorSheet", (app, html) => {
    const root = html?.[0] ?? html;
    const tokenName = getActorTokenName(app.actor);

    if (!root || !tokenName) return;

    function processItemDescriptions(container) {
        if (!container) return;

        if (
            container.matches?.(".item-summary, .item-description")
        ) {
            replacePlaceholderInElement(container, tokenName);
        }

        container.querySelectorAll?.(
            ".item-summary, .item-description"
        ).forEach(element => {
            replacePlaceholderInElement(element, tokenName);
        });
    }

    processItemDescriptions(root);

    const observer = new MutationObserver(mutations => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    processItemDescriptions(node);
                } else if (
                    node.nodeType === Node.TEXT_NODE &&
                    node.nodeValue.includes(PLACEHOLDER)
                ) {
                    const parent = node.parentElement;

                    if (parent?.closest(
                        ".item-summary, .item-description"
                    )) {
                        node.nodeValue = node.nodeValue
                            .split(PLACEHOLDER)
                            .join(tokenName);
                    }
                }
            }
        }
    });

    observer.observe(root, {
        childList: true,
        subtree: true
    });
});


function replaceHudTooltip(root = document) {
    const tooltip = root.matches?.("#tooltip")
        ? root
        : root.querySelector?.("#tooltip")
            ?? document.querySelector("#tooltip");

    if (!tooltip) return;

    const token = canvas.tokens.controlled[0];
    const tokenName = token?.document?.name
        ?? token?.actor?.name;

    if (!tokenName) return;

    replacePlaceholderInElement(tooltip, tokenName);
}

Hooks.once("ready", () => {
    const observer = new MutationObserver(() => {
        replaceHudTooltip();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    replaceHudTooltip();
});
