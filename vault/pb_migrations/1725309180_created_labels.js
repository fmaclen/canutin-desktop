/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "5y1xplqly05y4ng",
    "created": "2024-09-02 20:33:00.915Z",
    "updated": "2024-09-02 20:33:00.915Z",
    "name": "labels",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "sok4ovur",
        "name": "name",
        "type": "text",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "pkr25dgz",
        "name": "isLabelGroup",
        "type": "bool",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "pkombuiv",
        "name": "for",
        "type": "select",
        "required": false,
        "presentable": false,
        "unique": false,
        "options": {
          "maxSelect": 1,
          "values": [
            "accounts",
            "assets",
            "transactions"
          ]
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
  const collection = dao.findCollectionByNameOrId("5y1xplqly05y4ng");

  return dao.deleteCollection(collection);
})
