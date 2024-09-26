import type { DateRange, Selected } from "bits-ui";
import { frequencyStore } from "./stores/store";
import { get } from "svelte/store";

export const listOptions = [
  {
    label: "🇺🇸📰 US National News (45)",
    value: "1332377355562717189",
  },
  {
    label: "🇬🇧📰 UK National News (26)",
    value: "1339570489530966018",
  },
  {
    label: "🇪🇸📰 Spanish National News (63)",
    value: "1291353744735600640",
  },
  {
    label: "🇪🇸📰 National & Local News (667)",
    value: "1378323089533063170",
  },
  {
    label: "🇺🇸 US Members of Congress (550)",
    value: "34179516",
  },
  {
    label: "🇺🇸 US Political Reporters (137)",
    value: "234326967",
  },
  {
    label: "🇬🇧 UK Members of Parliament (599)",
    value: "1810049120318456213",
  },
  {
    label: "🇬🇧 UK Political Reporters (204)",
    value: "1303626281611919361",
  },
  {
    label: "🇪🇸 Spain Members of Congress (315)",
    value: "1685953383004262400",
  },
  {
    label: "🇪🇸 Spanish Political Reporters (428)",
    value: "1314894201180557313",
  },
  {
    label: "🇺🇸 Tech News (231)",
    value: "31748",
  },
  {
    label: "🇪🇸 Spanish Celebrities",
    value: "1317420882877448192",
  },
  {
    label: "🇪🇸 Economist Influencers",
    value: "1120825973056921604",
  },
];

export const languages: { value: string; label: string }[] = [
  { value: "US:en", label: "🇺🇸 English (US)" },
  { value: "ES:es", label: "🇪🇸 Spanish (Spain)" },
  { value: "SK:sk", label: "🇸🇰 Slovak" },
  { value: "AU:en", label: "🇦🇺 English (Australia)" },
  { value: "BW:en", label: "🇧🇼 English (Botswana)" },
  { value: "CA:en", label: "🇨🇦 English (Canada)" },
  { value: "ET:en", label: "🇪🇹 English (Ethiopia)" },
  { value: "GH:en", label: "🇬🇭 English (Ghana)" },
  { value: "IN:en", label: "🇮🇳 English (India)" },
  { value: "ID:en", label: "🇮🇩 English (Indonesia)" },
  { value: "IE:en", label: "🇮🇪 English (Ireland)" },
  { value: "IL:en", label: "🇮🇱 English (Israel)" },
  { value: "KE:en", label: "🇰🇪 English (Kenya)" },
  { value: "LV:en", label: "🇱🇻 English (Latvia)" },
  { value: "MY:en", label: "🇲🇾 English (Malaysia)" },
  { value: "NA:en", label: "🇳🇦 English (Namibia)" },
  { value: "NZ:en", label: "🇳🇿 English (New Zealand)" },
  { value: "NG:en", label: "🇳🇬 English (Nigeria)" },
  { value: "PK:en", label: "🇵🇰 English (Pakistan)" },
  { value: "PH:en", label: "🇵🇭 English (Philippines)" },
  { value: "SG:en", label: "🇸🇬 English (Singapore)" },
  { value: "ZA:en", label: "🇿🇦 English (South Africa)" },
  { value: "TZ:en", label: "🇹🇿 English (Tanzania)" },
  { value: "UG:en", label: "🇺🇬 English (Uganda)" },
  { value: "GB:en", label: "🇬🇧 English (United Kingdom)" },
  { value: "ZW:en", label: "🇿🇼 English (Zimbabwe)" },
  { value: "ID:id", label: "🇮🇩 Indonesian" },
  { value: "CZ:cs", label: "🇨🇿 Czech" },
  { value: "DE:de", label: "🇩🇪 German (Germany)" },
  { value: "AT:de", label: "🇦🇹 German (Austria)" },
  { value: "CH:de", label: "🇨🇭 German (Switzerland)" },
  { value: "AR:es-419", label: "🇦🇷 Spanish (Argentina)" },
  { value: "CL:es-419", label: "🇨🇱 Spanish (Chile)" },
  { value: "CO:es-419", label: "🇨🇴 Spanish (Colombia)" },
  { value: "CU:es-419", label: "🇨🇺 Spanish (Cuba)" },
  { value: "US:es-419", label: "🇺🇸 Spanish (United States)" },
  { value: "MX:es-419", label: "🇲🇽 Spanish (Mexico)" },
  { value: "PE:es-419", label: "🇵🇪 Spanish (Peru)" },
  { value: "VE:es-419", label: "🇻🇪 Spanish (Venezuela)" },
  { value: "BE:fr", label: "🇧🇪 French (Belgium)" },
  { value: "CA:fr", label: "🇨🇦 French (Canada)" },
  { value: "FR:fr", label: "🇫🇷 French (France)" },
  { value: "MA:fr", label: "🇲🇦 French (Morocco)" },
  { value: "SN:fr", label: "🇸🇳 French (Senegal)" },
  { value: "CH:fr", label: "🇨🇭 French (Switzerland)" },
  { value: "IT:it", label: "🇮🇹 Italian" },
  { value: "LV:lv", label: "🇱🇻 Latvian" },
  { value: "LT:lt", label: "🇱🇹 Lithuanian" },
  { value: "HU:hu", label: "🇭🇺 Hungarian" },
  { value: "BE:nl", label: "🇧🇪 Dutch (Belgium)" },
  { value: "NL:nl", label: "🇳🇱 Dutch (Netherlands)" },
  { value: "NO:no", label: "🇳🇴 Norwegian" },
  { value: "PL:pl", label: "🇵🇱 Polish" },
  { value: "BR:pt-419", label: "🇧🇷 Portuguese (Brazil)" },
  { value: "PT:pt-150", label: "🇵🇹 Portuguese (Portugal)" },
  { value: "RO:ro", label: "🇷🇴 Romanian" },
  { value: "SI:sl", label: "🇸🇮 Slovenian" },
  { value: "SE:sv", label: "🇸🇪 Swedish" },
  { value: "VN:vi", label: "🇻🇳 Vietnamese" },
  { value: "TR:tr", label: "🇹🇷 Turkish" },
  { value: "GR:el", label: "🇬🇷 Greek" },
  { value: "BG:bg", label: "🇧🇬 Bulgarian" },
  { value: "RU:ru", label: "🇷🇺 Russian" },
  { value: "UA:ru", label: "🇺🇦 Russian (Ukraine)" },
  { value: "RS:sr", label: "🇷🇸 Serbian" },
  { value: "UA:uk", label: "🇺🇦 Ukrainian" },
  { value: "IL:he", label: "🇮🇱 Hebrew" },
  { value: "AE:ar", label: "🇦🇪 Arabic (UAE)" },
  { value: "SA:ar", label: "🇸🇦 Arabic (Saudi Arabia)" },
  { value: "LB:ar", label: "🇱🇧 Arabic (Lebanon)" },
  { value: "EG:ar", label: "🇪🇬 Arabic (Egypt)" },
  { value: "IN:mr", label: "🇮🇳 Marathi" },
  { value: "IN:hi", label: "🇮🇳 Hindi" },
  { value: "BD:bn", label: "🇧🇩 Bengali (Bangladesh)" },
  { value: "IN:bn", label: "🇮🇳 Bengali (India)" },
  { value: "IN:ta", label: "🇮🇳 Tamil" },
  { value: "IN:te", label: "🇮🇳 Telugu" },
  { value: "IN:ml", label: "🇮🇳 Malayalam" },
  { value: "TH:th", label: "🇹🇭 Thai" },
  { value: "CN:zh-Hans", label: "🇨🇳 Chinese (Simplified)" },
  { value: "TW:zh-Hant", label: "🇹🇼 Chinese (Traditional, Taiwan)" },
  { value: "HK:zh-Hant", label: "🇭🇰 Chinese (Traditional, Hong Kong)" },
  { value: "JP:ja", label: "🇯🇵 Japanese" },
  { value: "KR:ko", label: "🇰🇷 Korean" },
];

export function cleanText(text: string): string {
  text = text.replace(/[^\S\r\n]+/g, " ");

  text = text.replace(/[^\x20-\x7E\r\n]/g, "");

  text = text
    .split("\n")
    .map((line) => line.replace(/^[\s,]+|[\s,]+$/g, ""))
    .join("\n");

  text = text.replace(/^\n+|\n+$/g, "");

  text = text.replace(/,+$/, "");

  return text;
}

export function cleanQueries(queries: string[]): string[] {
  const output: string[] = [];

  for (const q of queries) {
    output.push(cleanText(q));
  }

  return output;
}

type TwitterInterval = {
  until: string;
  since: string;
};

type TimeUnit = "day" | "week" | "month" | "year";

export function getDateRangeScope(dateRange: DateRange): TimeUnit {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (!dateRange) {
    return "day";
  }

  const endDate = new Date(dateRange.end?.toString());
  const startDate = new Date(dateRange.start?.toString());

  const diff = endDate.getTime() - startDate.getTime();

  const msPerDay = 1000 * 60 * 60 * 24;
  const msPerWeek = msPerDay * 7;
  const avgMsPerMonth = msPerDay * 30.44; // average number of days in a month
  const avgMsPerYear = msPerDay * 365.25; // accounting for leap years

  const yearsDiff = Math.floor(diff / avgMsPerYear);
  const monthsDiff = Math.floor(diff / avgMsPerMonth);
  const weeksDiff = Math.floor(diff / msPerWeek);
  const daysDiff = Math.floor(diff / msPerDay);

  if (yearsDiff >= 1) {
    return "year";
  } else if (monthsDiff >= 1) {
    return "month";
  } else if (weeksDiff >= 1) {
    return "week";
  } else {
    return "day";
  }
}

export function getSelectionOptions(dateRange: DateRange) {
  const scope = getDateRangeScope(dateRange);

  const options = [
    { value: "Daily", label: "Daily", disabled: false },
    { value: "Weekly", label: "Weekly", disabled: true },
    { value: "Monthly", label: "Monthly", disabled: true },
    { value: "Anually", label: "Anually", disabled: true },
  ];

  switch (scope) {
    case "year":
      options[3].disabled = false;
    case "month":
      options[2].disabled = false;
      if (get(frequencyStore) == "Anually") frequencyStore.set("Monthly");
    case "week":
      options[1].disabled = false;
      const fStore = get(frequencyStore);
      if (fStore == "Monthly" || fStore == "Anually")
        frequencyStore.set("Weekly");
      break;
  }

  return options;
}

export function groupTimeRanges(timeSteps: Date[], selectedRange: DateRange) {
  if (!timeSteps || !selectedRange) {
    return [];
  }

  if (
    selectedRange.start > selectedRange.end ||
    timeSteps.length == 0 ||
    !timeSteps
  ) {
    return [];
  }

  const output: TwitterInterval[] = [];

  let i = 1;
  for (i; i < timeSteps.length; i++) {
    const since = twitterDateFormat(timeSteps[i - 1]);
    const until = twitterDateFormat(timeSteps[i]);

    output.push({ since: since, until: until });
  }

  output.push({
    since: twitterDateFormat(timeSteps[i - 1]),
    until: twitterDateFormat(
      new Date(
        selectedRange.end?.year,
        selectedRange.end?.month - 1,
        selectedRange.end?.day,
      ),
    ),
  });

  return output;
}

export function addListsToQueries(queries: string, lists: Selected<string>[]) {
  if (queries == "" || !queries) return "";
  if (!lists || lists.length == 0) return queries;

  const queriesSplit = queries.trim().split("\n");
  let queriesWithLists = "";

  for (let q of queriesSplit) {
    q = q.trim();
    for (const l of lists) {
      const listID = l.value;
      q += ` list:${listID}`;
    }
    queriesWithLists += `${q.trim()}\n`;
  }

  return queriesWithLists;
}

export async function jsonToCsv(
  url: string,
  customColumnOrder?: string[],
): Promise<Blob> {
  try {
    // Fetch JSON data from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData: any[] = await response.json();

    console.log(jsonData);
    if (
      !Array.isArray(jsonData) ||
      jsonData.length === 0 ||
      jsonData === undefined
    ) {
      throw new Error("Invalid JSON data: expected a non-empty array");
    }

    if (jsonData.every((o) => o.hasOwnProperty("noResults"))) {
      throw new Error("Apify returned an empty dataset.");
    }
    // Get all available headers from the first object
    // sometimes, Apify will return a {noResults: true} object
    // which will mess up with the csv creation
    let firstValidObjectIndex = 0;
    while (Object.keys(jsonData[firstValidObjectIndex]).length <= 1) {
      firstValidObjectIndex++;
    }
    const allHeaders = Object.keys(jsonData[firstValidObjectIndex]);

    // Determine the final header order
    let headers: string[];
    if (customColumnOrder) {
      // Use custom order, but include any missing headers at the end
      const missingHeaders = allHeaders.filter(
        (h) => !customColumnOrder.includes(h),
      );
      headers = [...customColumnOrder, ...missingHeaders];
    } else {
      headers = allHeaders;
    }

    let csvString = headers.join(",") + "\n";

    const formatValue = (value: any): string => {
      if (Array.isArray(value)) {
        // Convert array to comma-separated string and wrap in quotes
        return `"${value.toString()}"`;
      } else if (typeof value === "string") {
        // Wrap strings in quotes if they contain commas, newlines, or quotes
        return value.includes(",") ||
          value.includes("\n") ||
          value.includes('"')
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      } else {
        // For other types, convert to string
        return value.toString();
      }
    };

    // Add data rows
    jsonData.forEach((item) => {
      const row: string[] = headers.map((header) => {
        const value = item[header];
        return value !== undefined && value !== "noResults"
          ? formatValue(value)
          : "";
      });
      if (row.every((v) => v === "")) {
        csvString += "";
      } else {
        csvString += row.join(",") + "\n";
      }
    });

    return new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  } catch (error) {
    console.error("Error converting JSON to CSV:", error);
    throw error;
  }
}

export function enrichQueries(
  queries: string,
  timeSteps: Date[],
  selectedRange: DateRange,
  lists: Selected<string>[],
) {
  if (queries == "" || !queries) return "";

  const queriesOverTime = spreadQueriesOverTime(
    queries,
    timeSteps,
    selectedRange,
  );

  const queriesWithLists = addListsToQueries(queriesOverTime, lists);

  return queriesWithLists;
}

export function spreadQueriesOverTime(
  queries: string,
  timeSteps: Date[],
  selectedRange: DateRange,
) {
  if (queries == "" || !queries) return "";
  if (!timeSteps || !selectedRange) return queries;

  const queriesSplit = queries.split("\n");
  let queriesSpreadOverTime = "";

  const intervalsGrouped = groupTimeRanges(timeSteps, selectedRange);

  if (intervalsGrouped.length == 0 || !intervalsGrouped) {
    return queries;
  }

  for (let q of queriesSplit) {
    for (let i = 0; i < intervalsGrouped.length; i++) {
      const since = intervalsGrouped[i].since;
      const until = intervalsGrouped[i].until;
      q = q.trim();

      queriesSpreadOverTime += `${q} since:${since} until:${until}\n`;
    }
    queriesSpreadOverTime += "\n";
  }

  return queriesSpreadOverTime;
}

export function twitterDateFormat(date: Date) {
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); //bitch
  const year = date.getFullYear();

  return `${year}-${month}-${day}`;
}

/*************/
`
n is the intervalNumber chosen by user

minutely: */n * * * *
hourly: 0 */n * * *
daily: 0 0 */n * * -> maybe substitute initial 0's for minute and hour
weekly: 0 0 * * 1 -> maybe substitute 1 for day of week, 0's for minute and hour
montly: 0 0 1 */1 * -> maybe substitute initial 0's for minute and hour, substitute 1 for current day of month
yearly: 0 0 1 */n * -> maybe substitute initial 0's for minute and hour
`;

export function composeCronExpression(
  intervalNumber: number,
  frequency: string,
  time?: { hour: number; minute: number },
) {
  if (intervalNumber === null || intervalNumber === undefined) {
    intervalNumber = 1;
  }
  const today = new Date();
  const dayOfMonth = today.getDate();

  const min = time != undefined ? time.minute : today.getMinutes();
  const h = time != undefined ? time.hour : today.getHours();

  let cronExpression: string = "";

  switch (frequency) {
    case "minute":
      cronExpression = `*/${intervalNumber} * * * *`;
      break;

    case "hour":
      cronExpression = `0 */${intervalNumber} * * *`;
      break;

    case "day":
      cronExpression = `${min} ${h} */${intervalNumber} * *`;
      break;

    case "month":
      cronExpression = `${min} ${h} 1 */${intervalNumber} *`;
      break;

    case "year":
      cronExpression = `${min} ${h} ${dayOfMonth} */${12 * intervalNumber} *`;
      break;
  }

  return cronExpression;
}

export function identifyCronExpression(
  cronExpression: string,
  intervalNumber: number,
) {
  if (intervalNumber === null || intervalNumber === undefined) {
    intervalNumber = 1;
  }
  const mRegex = /\*\/\d \* \* \* \*/; //minutes
  const hRegex = /0 \*\/\d \* \* \*/;
  const dRegex = /\d \d \*\/\d \* \*/;

  const MRegex = new RegExp(
    String.raw`\d \d \d */${intervalNumber.toString()} *`,
  );
  const yRegex = /\d \d \d \*\/\d \*/;

  switch (true) {
    case mRegex.test(cronExpression):
      return "minutes";

    case dRegex.test(cronExpression):
      return "days";

    case hRegex.test(cronExpression):
      return "hours";

    case MRegex.test(cronExpression):
      return "months";

    case yRegex.test(cronExpression):
      return "years";
  }
}
