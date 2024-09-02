/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bibcsj4ts9rlc1q")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nhbwkzhk",
    "name": "asset",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "2qcdy4e6rcmy303",
      "cascadeDelete": true,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bibcsj4ts9rlc1q")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nhbwkzhk",
    "name": "asset",
    "type": "relation",
    "required": true,
    "presentable": false,
    "unique": false,
    "options": {
      "collectionId": "2qcdy4e6rcmy303",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": null
    }
  }))

  return dao.saveCollection(collection)
})
