import * as SQLite from "expo-sqlite";

// Open a database
/**
 * @type {SQLite.SQLiteDatabase}
 */
let db; // Declare db outside of functions for reuse

// Open the database
const openDatabase = async () => {
  try {
    // Open the database (this should be a single call for reuse)
    db = await SQLite.openDatabaseAsync("ip_tv");
    console.log("Database opened");
    await createTables(); // Ensure the table exists
  } catch (error) {
    console.error("Failed to open database:", error);
  }
};

// Function to create tables just in case
const createTables = async () => {
  try {
    await db.execAsync(
      `CREATE TABLE IF NOT EXISTS channels (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          referer TEXT,
          link TEXT NOT NULL UNIQUE,
          state TEXT
        );`
    );
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Helper function to wrap database queries in Promises

// Function to run a query and fetch all results
const allQuery = async (query, params = []) => {
  try {
    const result = await runQuery(query, params);
    return result.rows._array; // Return the rows as an array
  } catch (error) {
    throw new Error(`Error fetching data: ${error.message}`);
  }
};

// ✅ Insert channels into the database
const insertChannels = async (channels) => {
  for (const channel of channels) {
    try {
      await db.runAsync(
        `INSERT INTO channels (name, referer, link, state) VALUES (?, ?, ?, ?)`,
        [
          channel.name,
          channel.referer || null,
          channel.link,
          channel.state || null,
        ]
      );
    } catch (error) {
      console.error("Error inserting channel:", error.message);
    }
  }
};

// ✅ Fetch all channels
const getAllChannels = async () => {
  try {
    return await db.getAllAsync("SELECT * FROM channels");
  } catch (error) {
    console.error("Error fetching channels:", error.message);
    return [];
  }
};

// Fetch channels with pagination
const getChannelsPaginated = async (limit, offset) => {
  try {
    return await db.getAllAsync("SELECT * FROM channels LIMIT ? OFFSET ?", [
      limit,
      offset,
    ]);
  } catch (error) {
    console.error("Error fetching paginated channels:", error.message);
    return [];
  }
};

// Search channels by name
const searchChannelsByName = async (query) => {
  try {
    return await db.getAllAsync(
      "SELECT * FROM channels WHERE LOWER(name) LIKE ?",
      [`%${query.toLowerCase()}%`]
    );
  } catch (error) {
    console.error("Error searching channels:", error.message);
    return [];
  }
};

// Helper function to parse m3u8 data into channels
const m3u8Parser = (file = "") => {
  const lines = file.split("\n");
  const channels = [];
  let currentChannel = null;

  for (const line of lines) {
    if (line.includes("#EXTINF")) {
      currentChannel = {
        name: line.split(",")[1],
        referer: null,
        link: null,
        quality: {},
      };
      channels.push(currentChannel);
    } else if (line.includes("http-referrer") && currentChannel) {
      currentChannel.referer = line.split("http-referrer=")[1];
    } else if (!line.startsWith("#") && currentChannel) {
      currentChannel.link = line;
    }
  }
  return channels;
};

// Exporting functions for later usage
export {
  openDatabase,
  createTables,
  insertChannels,
  getAllChannels,
  getChannelsPaginated,
  searchChannelsByName,
  m3u8Parser,
};
