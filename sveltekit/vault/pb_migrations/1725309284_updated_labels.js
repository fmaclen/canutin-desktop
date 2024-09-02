/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5y1xplqly05y4ng")

  collection.name = "tags"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("5y1xplqly05y4ng")

  collection.name = "labels"

  return dao.saveCollection(collection)
})
