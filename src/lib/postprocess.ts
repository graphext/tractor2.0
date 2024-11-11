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
  return `(object) => { const { author, ${Object.keys(tweetTypeMap).join(
    ", "
  )} } = object; return { ${Object.keys(tweetTypeMap)
    .map((e) => '"' + e + "<gx:" + tweetTypeMap[e] + ">" + '": ' + e)
    .join(", ")}, "first_media_element<gx:url>": media[0], ${Object.keys(
    tweetAuthorMap
  ).map(
    (e) =>
      '"' +
      e +
      "<gx:" +
      tweetAuthorMap[e] +
      ">" +
      '": ' +
      "author." +
      e.slice(6).charAt(0).toLowerCase() +
      e.slice(7)
  )} }; }`;
}
