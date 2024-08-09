export const keywordPrompt = `Given this information, which is a list
of search terms provided to an Apify task that scrapes twitter as input, 
please provide real word that encapsulates the information that the tweets are all about.

For example, given a set of search terms like:

olympics
#OlympicGames
"olympic games" filter:media


something like "olympics" should look good.

No yapping, no explanation, provide exclusively the word itself, with no additional spaces, periods or quotes.
Just a single, real word that can be use as a quick, humanly readable id.
`;
