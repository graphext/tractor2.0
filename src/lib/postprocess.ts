
const typeMap = {
	createdAt: "date",
	text: "text",
	url: "url",
	viewCount: "number",
	retweetCount: "number",
	replyCount: "number",
	likeCount: "number",
	quoteCount: "number",
	lang: "category",
	bookmarkCount: "number",
	source: "category",
	isReply: "boolean",
	isRetweet: "boolean",
	isQuote: "boolean",
	media: "list[url]",
};

const authorMap = {
	authorName: "category",
	authorUserName: "category",
	authorUrl: "url",
	authorFollowers: "number",
	authorCreatedAt: "date",
	authorIsVerified: "boolean",
	authorProfilePicture: "url",
	authorCoverPicture: "url",
	authorDescription: "text",
	authorLocation: "category",
};


export function createFunctionString() {
    return `(object) => { const { author, ${Object.keys(typeMap).join(", ")} } = object; return { ${Object.keys(
        typeMap,
    )
        .map((e) => '"' + e + "<gx:" + typeMap[e] + ">" + '": ' + e)
        .join(
            ", ",
        )}, ${Object.keys(authorMap).map((e) => '"' + e + "<gx:" + authorMap[e] + ">" + '": ' + "author." + e.slice(6).charAt(0).toLowerCase() + e.slice(7))} }; }`;
}