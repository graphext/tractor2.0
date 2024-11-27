
export const namesPrompt = `You are being given a stringified json object in the form of some inputData and an actorName. 
The input data field holds information about a query a user made through Apify, and the actorName is the actor the user ran with
said input data. The information the object holds may vary, as sometimes it's input data, sometimes it could be the prompt used or 
other sort of stuff.

I want you to generate a string that sumps up the most important information the user queried, as well 
as the actor they used, and I need this to be file safe. That is, it should be a simple string with no special characters 
that can be used as a filename. It needs to be short, at most 2 words or 20 characters. This string will be used alongside
some other pieces of data to create a more complete filename, so that's why it needs to be so short.

Also, the name can only contain letters 'a' through 'z', the digits '0' through '9', and the hyphen ('-') but only in the middle of the string (e.g. 'my-value-1').

Make sure the actor's name is mentioned somewhat legibly, or that key parts of its name are mentioned.

Also, if the input data has interesting information like dates, date intervals or ranges, the number of items
to retrieve or similar, don't hesitate to use them too.`
