import { toast } from 'svelte-sonner'
import type { DateRange, Selected } from "bits-ui";
import type { ApifyClient } from "./apifyEndpoints";
import { frequencyStore } from "./stores/store";
import { get } from "svelte/store";

import type { Task, TypedJsonToCsvOptions, TypedUnwindTarget } from "./types";
import { appState } from './stores/appStateStore';


export async function createFileName({ actorName, information, datasetId }: { actorName: string, information: object, datasetId: string }) {

  const fileKeyword = await generateNames(actorName, JSON.stringify(information));

  return `${fileKeyword}_${datasetId.slice(-6)}_TR`;
}

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

function unique(array: object[], field: string) {
  return Array.from(new Map(array.map((item) => [item[field], item])).values());
}

interface UnwindField {
  field: string;
  alias?: string; // Optional alias for the output column name
}

interface UnwindTarget {
  targetCol: string;
  fields: UnwindField[];
  take?: number; // New parameter for how many items to take
}

interface JsonToCsvOptions {
  url: string;
  dedupKey?: string | null;
  customColumnOrder?: string[];
  unwind?: UnwindTarget[] | null;
}

function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, part) => current?.[part], obj);
}

function flattenObjectWithUnwind<T>(
  obj: any,
  unwindTargets: TypedUnwindTarget<T>[] | null = null,
  prefix: string = "",
): Record<string, any> {
  return Object.keys(obj).reduce((acc: Record<string, any>, key: string) => {
    const pre = prefix.length ? `${prefix}.` : "";
    const value = obj[key];

    // Check if this key is one of our unwind targets
    const unwindTarget = unwindTargets?.find(
      (target) => target.targetCol === key,
    );

    if (unwindTarget && Array.isArray(value)) {
      // Handle the unwind case for this target
      unwindTarget.fields.forEach((fieldDef) => {
        const take = unwindTarget.take || 1;
        const fieldPath = fieldDef.field;

        if (take != "max") {
          value.slice(0, take)
        }

        // Extract values from the array
        const extractedValues = value
          .map((item) => getNestedValue(item, fieldPath))
          .filter((v) => v !== undefined);

        // Use alias if provided, otherwise construct default column name
        const outputKey = fieldDef.alias || `${pre}${key}.${fieldDef.field}`;

        // If we're taking multiple values, store as an array
        // If taking just one, store as a single value for backward compatibility
        acc[outputKey] = take === 1 ? extractedValues[0] : extractedValues;
      });

      // Keep the original array as well
      acc[pre + key] = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      Object.assign(
        acc,
        flattenObjectWithUnwind(value, unwindTargets, pre + key),
      );
    } else {
      acc[pre + key] = value;
    }

    return acc;
  }, {});
}

export function pivotJson<T>(
  json: T[],
  pivotColumn: string,
  fieldsToUnpivot: string[],
): Record<string, any> {
  const output = [];

  json.forEach((obj) => {
    const pivotValues = getNestedValue(obj, pivotColumn);
    if (Array.isArray(pivotValues)) {
      pivotValues.forEach((pivotValue) => {
        const newRow = { ...obj };
        fieldsToUnpivot.forEach((field) => {
          const nestedValue = getNestedValue(pivotValue, field);
          if (nestedValue !== undefined) {
            newRow[field] = nestedValue;
          }
        });
        output.push(newRow);
      });
    }
  });

  return output;
}

/**
 * Downloads a JSON file from the provided URL, flattens nested objects,
 * optionally deduplicates the data based on a key, and then converts
 * the data to a CSV format.
 *
 * @param {string} url The URL of the JSON file to download
 * @param {string} [dedupKey=null] The key to use for deduplicating the data
 * @param {string[]} [customColumnOrder=[]] The order of columns in the output CSV
 * @param {object[]} [unwind=[]] Fields to unwind from objects to arrays
 * @param {string[]} [removeColumns=[]] Columns to remove from the output CSV after having used them.
 * @param {object} [pivot=null] Options for pivoting the data
 * @returns {Promise<Blob>} A promise that resolves with a CSV blob
 */
export async function jsonToCsv<T>({
  url,
  dedupKey = null,
  customColumnOrder,
  unwind,
  removeColumns,
  pivot = null
}: TypedJsonToCsvOptions<T>): Promise<Blob> {
  try {
    // Fetch JSON data from the provided URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let jsonData: T[] = await response.json();

    const emptyError = new Error("Apify returned an empty table. This could mean your search is too narrow. Try searching for broader topics or dates.");

    if (
      !Array.isArray(jsonData) ||
      jsonData.length === 0 ||
      jsonData === undefined
    ) {
      throw emptyError;
    }

    if (jsonData.every((o) => o.hasOwnProperty("noResults"))) {
      throw emptyError;
    }

    if (pivot != null) {
      jsonData = pivotJson<T>(jsonData, pivot.column, pivot.pivot);
      console.log(jsonData);
    }

    if (dedupKey && dedupKey !== "") {
      console.log(" items before deduplication", jsonData.length);
      jsonData = unique(jsonData, dedupKey);
      console.log(" items after deduplication", jsonData.length);
    }

    const flattenedData = jsonData.map((item) =>
      flattenObjectWithUnwind<T>(item, unwind),
    );

    const allHeaders = [
      ...new Set(flattenedData.flatMap((item) => Object.keys(item))),
    ];

    let headers: string[];
    if (customColumnOrder) {
      const missingHeaders = allHeaders
        .filter((h) => !customColumnOrder.includes(h))
        .filter((h) => !removeColumns?.includes(h));
      headers = [...customColumnOrder, ...missingHeaders];
    } else {
      headers = allHeaders;
    }

    const rows = flattenedData.map((item) =>
      headers.map((header) => {
        const value = item[header] ?? "";
        // Handle different types of values
        const stringValue = Array.isArray(value)
          ? JSON.stringify(value)
          : String(value);
        // Check if value needs to be quoted
        const needsQuoting =
          stringValue.includes(",") ||
          stringValue.includes("\n") ||
          stringValue.includes('"');

        if (needsQuoting) {
          // Escape quotes and wrap in quotes
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }),
    );

    const csvString = [headers, ...rows].map((row) => row.join(",")).join("\n");

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


export async function generateDatasetName(queries: string) {
  try {
    const res = await fetch("/api/ids", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: queries }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${res.status}`,
      );
    }

    return res.text();
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}

/**
 * Truncates the JSON representation of an object to a specified maximum number of tokens.
 * Sometimes, large queries would prevent you from downloading data just because
 * the name of the task gave an error. 
 * @param {any} information - The object to be truncated.
 * @param {number} [maxTokens=64000] - The maximum number of tokens allowed in the JSON string.
 * @returns {any} - The original object if the JSON string length is within the limit, otherwise the truncated object.
 */
function truncateObject(information: any, maxTokens: number = 64000): any {
  let jsonString = JSON.stringify(information);
  if (jsonString.length > maxTokens) {
    // Truncate the JSON string to the maximum allowed length
    jsonString = jsonString.substring(0, maxTokens);
    // Parse the truncated string back to an object
  }
  return information;
}

export async function generateNames(actor: string, information: object) {
  try {
    const res = await fetch("/api/names", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(({ inputData: truncateObject(information), actorName: actor })),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${res.status}`,
      );
    }

    return res.text();
  } catch (err) {
    console.error("Error:", err);
    throw err;
  }
}


export async function submitTask(
  {
    apifyClient,
    inputData,
    onTaskCreated,
    onError,
    onStatusCheckStart,
  }:
    {
      apifyClient: ApifyClient,
      inputData: any,
      onTaskCreated: Function,
      onError: Function,
      onStatusCheckStart?: Function,
    }) {
  let runId;
  let taskName
  let oldTaskName

  try {
    taskName = await generateNames(apifyClient.name, inputData)
    taskName = taskName.replace(/[^a-zA-Z0-9-\-]/g, "")

    const task = await apifyClient.createTask(taskName, inputData);
    runId = await apifyClient.runTask(task.data.id).then((run) => run.data.id);

    onTaskCreated(runId);

    appState.set('running')

    if (onStatusCheckStart)
      setTimeout(onStatusCheckStart, 1500);
  } catch (err: any) {

    const stringError = err.toString()

    if (stringError.includes("actor-task-name-not-unique")) {
      oldTaskName = taskName
      taskName += `-${Math.floor(Math.random() * 1000)}`

      const task = await apifyClient.createTask(taskName!, inputData);
      runId = await apifyClient.runTask(task.data.id).then((run) => run.data.id);

      onTaskCreated(runId);

      toast.warning(`${oldTaskName} was already in use, renamed to ${taskName}`)


    } else {
      appState.set('error')
      onError(err);
    }

  }
}


export async function checkTaskStatus({
  apifyClient,
  runId,
  maxResults,
  onStatusUpdate,
  onComplete,
  onError,
}: {
  apifyClient: ApifyClient,
  runId: string | null,
  maxResults: number,
  onStatusUpdate: Function,
  onComplete: Function,
  onError: Function,

}) {
  let status;

  try {
    const runData = await apifyClient.getRunStatus(runId!);
    status = runData.data.status;

    const { data: liveData, length: dataLength } = await apifyClient.getDatasetContent(runId!);

    if (status === "SUCCEEDED" || status === "ABORTED") {

      if (status === "SUCCEEDED") appState.set('success');

      try {
        await onComplete({
          runId,
          status
        });

      } catch (e) {
        onError(e);
      }

      return;
    }

    if (status !== "FAILED" && status !== "TIMED-OUT") {
      setTimeout(() => checkTaskStatus({ apifyClient, runId, maxResults, onStatusUpdate, onComplete, onError }), 1000);
    } else {
      throw new Error("Run failed or timed-out.");
    }

    onStatusUpdate({ status, dataLength, liveData });

  } catch (err) {
    onError(err);
    throw err;
  }

}

export function sendEventData(eventData: any) {
  if (window.dataLayer) {
    window.dataLayer.push(eventData)
  }
}
