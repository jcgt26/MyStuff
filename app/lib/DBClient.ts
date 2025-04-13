import {Client} from "pg";

export default class DBClient{
     private static _instance: DBClient | null = null;
     private static client: Client | null = null;

      private constructor() {
          if (DBClient.client === null) {
              try {
                  DBClient.client = new Client({
                      connectionString: process.env.POSTGRES_URL,
                  })
              } catch (exception) {
                  console.error(`There was an error when trying to initialize Client to the database: ${exception}`);
              }
          }
      }

    public static async getInstance() {
        if(DBClient._instance === null) {
            DBClient._instance = new DBClient();
            try {
                await DBClient.client?.connect();
            }catch (exception) {
                console.error(`There was an error when trying to connect to the database: ${exception}`);
                DBClient.client = null;
            }
            console.log("Client connected successfully");
        }

        return DBClient._instance;
    }

    public async runQuery(query: string): Promise<any> {
          if(query === undefined || query === null) {
              throw new Error("Missing query parameter");
          }
        console.log(`Query: ${JSON.stringify(query)}`);

          return DBClient.client?.query(query);
    }

    /* TODO create a transaction builder for multiple queries?? */
    public async runTransaction(query: string): Promise<any> {
          try {
              await DBClient.client?.query("BEGIN");
              console.log("Starting transaction...");

              await DBClient.client?.query(query);

              await DBClient.client?.query("COMMIT");
              console.log("Ending transaction...");
          }catch (exception) {
              await DBClient.client?.query("ROLLBACK");
              console.error('Transaction rolled back due to error:', exception);
              throw exception; // Re-throw the error to be handled by the caller
          }
    }

}