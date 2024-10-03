import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

let gridFSBucket: GridFSBucket | undefined;

mongoose.connection.once('open', () => {
  if (mongoose.connection.db) {
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    console.log('GridFSBucket criado com sucesso.');
  }
});

export const getGridFSBucket = (): GridFSBucket | undefined => {
  return gridFSBucket;
};
