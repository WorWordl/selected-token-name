const MODULE_ID = "selected-token-name";
const PLACEHOLDER = "{{selectedTokenName}}";

function getSheetTokenName(app) {
    const actor = app.item?.parent ?? app.actor;

    if (!actor) return null;

    if (actor.isToken && actor.token) {
        return actor.token.name;
    }

    const tokens = actor.getActiveTokens();

    if (tokens.length !== 1) return null;

    return tokens[0].document?.name
        ?? tokens[0].name
        ?? null;
}

function replaceTokenPlaceholder(html, tokenName) {
    if (!html || !tokenName) return html;

    return html.split(PLACEHOLDER).join(tokenName);
}

Hooks.once("ready", () => {
    console.log(`[${MODULE_ID}] 로디듣.`);
});