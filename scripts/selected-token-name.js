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

Hooks.once("ready", () => {
    console.log(`[${MODULE_ID}] 장전.`);
});