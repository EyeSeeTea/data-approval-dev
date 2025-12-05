import { D2Api, DataStore } from "../../../../types/d2-api";
import { Instance } from "../../entities/Instance";
import { getD2APiFromInstance } from "../../utils/d2-api";
import { d2ReportsDataStoreNamespace, glassDataStoreNamespace } from "./Namespaces";
import { StorageClient } from "./StorageClient";

export class DataStoreStorageClient extends StorageClient {
    private api: D2Api;
    private dataStore: DataStore;

    constructor(type: "user" | "global", instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
        switch (type) {
            case "user":
                switch (process.env.REACT_APP_REPORT_VARIANT) {
                    case "glass-admin":
                    case "glass-submission":
                        this.dataStore = this.api.userDataStore(glassDataStoreNamespace);
                        break;
                    default:
                        this.dataStore = this.api.userDataStore(d2ReportsDataStoreNamespace);
                }
                break;
            case "global":
                switch (process.env.REACT_APP_REPORT_VARIANT) {
                    case "glass-admin":
                    case "glass-submission":
                        this.dataStore = this.api.dataStore(glassDataStoreNamespace);
                        break;
                    default:
                        this.dataStore = this.api.dataStore(d2ReportsDataStoreNamespace);
                }
                break;
        }
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const value = await this.dataStore.get<T>(key).getData();
        return value;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const value = await this.getObject<T>(key);
        if (!value) await this.saveObject(key, defaultValue);
        return value ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, value: T): Promise<void> {
        await this.dataStore.save(key, value).getData();
    }

    public async removeObject(key: string): Promise<void> {
        try {
            await this.dataStore.delete(key).getData();
        } catch (error: any) {
            if (!error.response || error.response.status !== 404) {
                throw error;
            }
        }
    }
}
