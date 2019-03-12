(async () => {
	require('dotenv').config();
	const express = require('express');
	const graphqlHTTP = require('express-graphql');
	const {
		buildSchema
	} = require('graphql');
	const MongoClient = require('mongodb').MongoClient;
	const assert = require('assert');

	// Database Name
	const dbName = 'roguarditems';

	// Create a new MongoClient

	const client = await new MongoClient(process.env.MONGOURL).connect();
	const itemsCollection = await client.db(dbName).collection('items')



	const schema = buildSchema(`
  type Query {
    item(itemName: String!): Item
  }
  type Item {
    url: String
    itemName: String
    dropInfo: [DropInfo]
  }
  type DropInfo {
    name: String
    level: Int
    dropRate: Float
    type: String
  }
`);

	const root = {
		item: async (args) => {
			let resp = await itemsCollection.find({
				'itemName': args.itemName
			}).toArray()
			console.log(resp[0])
			return resp[0];
		}
	};

	const app = express();
	app.use('/graphql', graphqlHTTP({
		schema: schema,
		rootValue: root,
		graphiql: true,
	}));
	app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));
})();