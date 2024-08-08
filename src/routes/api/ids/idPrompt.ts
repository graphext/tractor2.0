export const idPrompt = `Given this information, which is a list
of search terms provided to an Apify task as input and a cron expression, 
please provide an id-like name, full lowercase, separated by dashes, that 
somewhat sums up what the data stored is going to look like.

For example, given a set of search terms and a cron expressoin like:

olympics
#OlympicGames
"olympic games" filter:media

*/3 * * * *

something like "olympics-minutely" should look good.

No yapping, no explanation, provide exclusively the id itself, with no additional spaces, periods or quotes.
`;
