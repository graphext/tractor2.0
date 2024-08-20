<a href="/" class="btn btn-primary">Back Home</a>
<main class="prose mt-10">
    <h1>Documentation</h1>

    <p>Here you'll find documentation on how to use Tractor.</p>

    <h2>What is Tractor?</h2>

    <p>
        Tractor is, primarily, a tweet retrieval tool based on <a
            href="https://apify.com">Apify</a
        >, a marketplace and service for scrapers.
    </p>
    <p>
        Tractor allows you to do exactly the same things you'd do in Apify, just
        much more quickly and with less clicks.
    </p>

    <h2>How do I use Tractor?</h2>

    <p>Using Tractor is pretty easy. Let's sum it up in 3 steps:</p>
    <ol>
        <li>Setup your Apify Key</li>
        <li>Ask for the tweets you want to find</li>
        <li>Get those tweets or schedule a task to run periodically</li>
    </ol>

    <h3>Setting up your Apify key</h3>
    <b>There are some prerequisites to this step.</b>
    <p>
        You must create an Apify account and that account must not be free. You
        have to, at least, sign up for the lowest tier, which currently costs
        $50/month.
    </p>
    <p>
        These $50 are not completely lost, though. These now become a kind of
        "credit" to use the tool. Anything that costs money inside Apify will
        use this money. That means you can scrape a huge amount of tweets for
        under $5, for example; and continue doing so during the month, until the
        subscription is renewed.
    </p>
    <p>
        For more details, please check out <a href="https://apify.com/pricing"
            >Apify's pricing page.</a
        >
    </p>
    <p>
        Once you To setup your Apify key, you'll head to <a
            href="https://console.apify.com/settings/integrations"
            >the Apify settings</a
        >, and go under "Integrations". There, you will find a list of keys,
        think of them like passwords that ideitify you uniquely. Grab one of
        those and put it in the Apify Key field inside Tractor.
    </p>

    <b
        >You will only need to follow this step once. We save the key so you can
        skip this step altogether next time you come into Tractor.</b
    >

    <h2>Asking for tweets</h2>

    <p>
        Once setup, just ask for tweets you'd like to analyze. Anything and
        everything applies:
    </p>
    <ol>
        <li>Get tweets from @graphext containing the word "data"</li>
        <li>Get tweets containing the term "cat" but not the term "dog"</li>
        <li>Get tweets using the hashtag #chocolate that are not replies</li>
        <li>Get tweets that contain photos talking about cats</li>
    </ol>

    <p>
        As you can see, this is quite powerful, since we can be quite specific
        about our needs. This will generate a list of so called "search terms",
        things you can search in Twitter's search bar.
    </p>

    <h3>Fine tuning the queries</h3>
    <p>
        When the search terms are generated, you can then scope them to a
        specific date range, change the frequency of the search (from daily to
        annually) and maybe add some curated lists.
    </p>

    <h2>Getting the data</h2>
    <p>
        Once the queries are in place, we can change the number of tweets we
        want to bring. 5000 is usually a good start, since the system will
        likely not bring that much data, although that depends heavily on what
        you are searching.
    </p>

    <p>
        You can rest assured that you won't get more than the maximum you set
        (and as such, you won't be over charged), but you can definitely get
        less than the maximum.
    </p>

    <p>
        If everything looks good, you can just click the massive "Get tweets"
        button and lots of gears will start spinning to fetch your data. Once
        it's finished, a new button will pop up, downloading your data in a
        Graphext-friendly format.
    </p>

    <p>
        You can optionally set up a schedule, which would repeat the task
        periodically.
    </p>
    <p>
        You can select the frequency of your schedule and hit the schedule
        button. This will generate two links:
    </p>
    <ol>
        <li>
            The first one, a link to the Apify Console where you can check the
            Storage object where all your data will live
        </li>
        <li>
            The second one, a direct link to the raw data, very convenient to
            just plug into Graphext as a "Remote File". This will fetch the data
            from the Storage and create a Graphext project. Afterwards, you can
            optionally also turn Recurrence, which tells Graphext to fetch data
            periodically from the specified link, for a spectacular combo: a
            full Graphext project updated on the latest twitter data.
        </li>
    </ol>
</main>
