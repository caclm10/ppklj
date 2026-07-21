/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_576912656")

  // update field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1680310438",
    "help": "",
    "hidden": false,
    "id": "relation4288725540",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "office_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_576912656")

  // update field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1680310438",
    "help": "",
    "hidden": false,
    "id": "relation4288725540",
    "maxSelect": 10,
    "minSelect": 0,
    "name": "office_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
