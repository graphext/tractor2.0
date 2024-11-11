export enum GraphextType {
  NUMBER = "number",
  CURRENCY = "currency",
  DATE = "date",
  TEXT = "text",
  CATEGORY = "category",
  URL = "url",
  SEX = "sex",
  BOOLEAN = "boolean",
}
export type GraphextArrayType = `${"list["}${Exclude<
  GraphextType,
  "text"
>}${"]"}`;

export type GraphextColumnType = GraphextType | GraphextArrayType;
