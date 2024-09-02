/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bwxajn9enyaq8xo")

  collection.name = "accountBalanceStatements"

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "oxksqobm",
    "name": "value",
    "type": "number",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null,
      "noDecimal": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("bwxajn9enyaq8xo")

  collection.name = "accountBalanbeStatements"

  // update
  collection.schema.addField(new SchemaField({
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
  }))

  return dao.saveCollection(collection)
})
