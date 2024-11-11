// ColumnMappings.ts
import { type GraphextColumnType } from "./graphextTypes";

export type ColumnMapping = {
  [columnName: string]: GraphextColumnType;
};

export class ColumnMappings {
  private mappings: ColumnMapping = {};
  constructor(config) {
    this.addMappings(config);
  }

  public addMapping(columnName: string, type: GraphextColumnType): void {
    this.mappings[columnName] = type;
  }

  public addMappings(mappings: {
    [columnName: string]: GraphextColumnType;
  }): void {
    Object.keys(mappings).forEach((columnName) => {
      this.addMapping(columnName, mappings[columnName]);
    });
  }

  public getMapping(columnName: string): GraphextColumnType | undefined {
    return this.mappings[columnName];
  }

  public removeMapping(columnName: string): void {
    delete this.mappings[columnName];
  }

  public getAllMappings(): ColumnMapping {
    return { ...this.mappings };
  }
}
