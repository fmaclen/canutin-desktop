/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "bwxajn9enyaq8xo",
    "created": "2024-09-02 20:35:52.153Z",
    "updated": "2024-09-02 20:35:52.153Z",
    "name": "accountBalanbeStatements",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "oxksqobm",
        "name": "amount",
        "type": "number",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "noDecimal": false
        }
      },
      {
        "system": false,
        "id": "ibzrrpm2",
        "name": "account",
        "type": "relation",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "collectionId": "qa5d0040txax605",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": null
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("bwxajn9enyaq8xo");

  return dao.deleteCollection(collection);
})
