import {System} from "./system";

export class Settings {
    version: string;
    types: string[];
    eiffelEventRepositories: { [id: string]: System };
}
