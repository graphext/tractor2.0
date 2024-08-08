export const descriptionPrompt = `You are going to generate a description 
for an Apify task that was scheduled. You'll receive the input search terms that 
we are going to use and the cron expression that was set.

Please return a simple sentence of no more than 10 words that describes this task and 
its recurrence for users to see. Keep it simple, keep it short. It is not necessary to include
every single detail. Just create a simple sentence of no more than 7 words.

No yapping, no explanation. Just a simple, one sentence description regarding the Apify task that was
created with the provided search terms and the cron expression.
`;
