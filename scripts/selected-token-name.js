const MODULE_ID = "selected-token-name";
const PLACEHOLDER = "{{selectedTokenName}}";

function getSheetTokenName(app) {
    const actor = app.item?.parent ?? app.actor;

    if (!actor) return null;

    if (actor.isToken && actor.token) {
        return actor.token.name ?? null;
    }

    const tokens = actor.getActiveTokens();

    if (tokens.length !== 1) {
        return null;
    }

    return tokens[0].document?.name ?? null;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function replaceDescriptionPlaceholder(app, html) {
    const tokenName = getSheetTokenName(app);

    if (!tokenName) return;

    const root = html?.[0] ?? html;

    if (!root?.querySelectorAll) return;

    const descriptionElements =
        root.querySelectorAll(".editor-content");

    if (descriptionElements.length === 0) return;

    const safeName = escapeHtml(tokenName);

    for (const element of descriptionElements) {
        if (!element.innerHTML.includes(PLACEHOLDER)) continue;

        element.innerHTML = element.innerHTML
            .split(PLACEHOLDER)
            .join(safeName);
    }
}

Hooks.on("renderItemSheet", (app, html) => {
    replaceDescriptionPlaceholder(app, html);
});

Hooks.once("ready", () => {
    console.log(`[${MODULE_ID}] Loaded.`);
});
