const tweetTypeMap = {
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

const tweetAuthorMap = {
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
	return `(object) => { const { author, ${Object.keys(tweetTypeMap).join(", ")} } = object; return { ${Object.keys(
		tweetTypeMap,
	)
		.map((e) => '"' + e + "<gx:" + tweetTypeMap[e] + ">" + '": ' + e)
		.join(
			", ",
		)}, ${Object.keys(tweetAuthorMap).map((e) => '"' + e + "<gx:" + tweetAuthorMap[e] + ">" + '": ' + "author." + e.slice(6).charAt(0).toLowerCase() + e.slice(7))} }; }`;
}

const gNewsTypeMap = {
	title: "category",
	link: "url",
	source: "category",
	sourceUrl: "url",
	publishedAt: "date",
	loadedUrl: "url",
	rssLink: "url",
	image: "url",
};

export function gNewsMapFunction() {
	return `(object) => return { ${Object.keys(gNewsTypeMap).map((e) => '"' + e + "<gx:" + gNewsTypeMap[e] + ">" + '": ' + e)} }`;
}
