/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yoa6bha8vvhkgk4")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "paol5lhm",
    "name": "status",
    "type": "select",
    "required": false,
    "presentable": false,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "values": [
        "read",
        "unread",
        "ongoing"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("yoa6bha8vvhkgk4")

  // remove
  collection.schema.removeField("paol5lhm")

  return dao.saveCollection(collection)
})
