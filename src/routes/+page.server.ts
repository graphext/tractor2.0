import { APIFY_AUTH_TOKEN } from "$env/static/private";

async function createTask(actorID: string, payload: Object) {
	const baseApifyURL = new URL("https://api.apify.com/v2/actor-tasks");
	const searchParams = baseApifyURL.searchParams;

	searchParams.append("actId", actorID);
	searchParams.append("name", "whatever"); //we can infer from prompt, or ask gepeto to generate a meaningful name

	const promise = await fetch(baseApifyURL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${APIFY_AUTH_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	return await promise.json();
}

async function runTask(taskId: string, payload: Object) {
	const baseApifyURL = new URL("https://api.apify.com/v2/actor-tasks");
	const searchParams = baseApifyURL.searchParams;

	searchParams.append("actId", actorID);
	searchParams.append("name", "whatever"); //we can infer from prompt, or ask gepeto to generate a meaningful name

	const promise = await fetch(baseApifyURL, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${APIFY_AUTH_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	return await promise.json();
}

const baseApifyURL = new URL("https://api.apify.com/v2/actor-tasks");
const actorID = "61RPP7dywgiy0JPD0"; //actor for twitter

export async function load({ fetch }) {
	const payload = {
		//we are pretending this is the payload we got from gepeto
		customMapFunction: "(object) => { return {...object} }",
		includeSearchTerms: false,
		maxItems: 10,
		onlyImage: false,
		onlyQuote: false,
		onlyTwitterBlue: false,
		onlyVerifiedUsers: false,
		onlyVideo: false,
		sort: "Latest",
		startUrls: [
			"from:@jesi-rgb since:2023-07-09 until:2023-08-09",
			"from:@jesi-rgb since:2023-08-09 until:2023-09-09",
			"from:@jesi-rgb since:2023-09-09 until:2023-10-09",
			"from:@jesi-rgb since:2023-10-09 until:2023-11-09",
			"from:@jesi-rgb since:2023-11-09 until:2023-12-09",
			"from:@jesi-rgb since:2023-12-09 until:2024-01-09",
			"from:@jesi-rgb since:2024-01-09 until:2024-02-09",
			"from:@jesi-rgb since:2024-02-09 until:2024-03-09",
			"from:@jesi-rgb since:2024-03-09 until:2024-04-09",
			"from:@jesi-rgb since:2024-04-09 until:2024-05-09",
			"from:@jesi-rgb since:2024-05-09 until:2024-06-09",
			"from:@jesi-rgb since:2024-06-09 until:2024-07-09",
		],
		tweetLanguage: "en",
	};

	// const task = createTask(actorID, payload);
	return { yea: "yea" };
}
