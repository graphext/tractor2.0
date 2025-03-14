
export const commonPrompt = `You may receive one or more company names. If multiple, return multiple lists of queries for each company. 
Regardless, do not add any separators or formatting, just a simple list of all the queries, separated by commas.

If the companies have a specific known location, or the user asks for a specific location of a company, like Burguer King Spain or similar, 
please write the queries in the language of that location. Focus on the company's main location and speak its language.

You are also given an approximate quantity of queries, in the form of "Less queries: ~5-10", "More queries: ~20-30" and "Many queries: ~50".
Please try to follow these instructions as closely as you can. Take into account that this range is per company, so ~20-30 queries
means that you should generate 20-30 queries for each company mentioned. The more companies you receive, the more queries you should generate.

Additionally, you will optionally be provided with a language. If no language is provided, default to English. If a language is provided, 
please output all your queries in said language.

No yapping, no explanation. Just an unformatted list of queries separated by commas containing the 
queries one would use to search for this company on Google if they didn't know it yet or
are looking for more information or potential competitors.
`
