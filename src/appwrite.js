import { Client, TablesDB, ID, Query, Permission, Role } from "appwrite";

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const tableId = import.meta.env.VITE_APPWRITE_TABLE_ID;

export const isAppwriteConfigured = Boolean(endpoint && projectId && databaseId && tableId);

const client = new Client();
if (endpoint && projectId) client.setEndpoint(endpoint).setProject(projectId);
export const tablesDB = new TablesDB(client);
export { ID, Query, Permission, Role, databaseId, tableId };
