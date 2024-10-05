import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let bucket: GridFSBucket | undefined;

export const getGridFSBucket = (): GridFSBucket => {
  if (!bucket) {
    const conn = mongoose.connection;
    if (!conn.db) {
      throw new Error("Conexão com o banco de dados não estabelecida.");
    }
    bucket = new GridFSBucket(conn.db, {
      bucketName: "uploads",
    });
  }
  return bucket;
};
