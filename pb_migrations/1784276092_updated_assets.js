/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1321337024")

  // add field
  collection.fields.addAt(14, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1321337024",
    "help": "",
    "hidden": false,
    "id": "relation4077675761",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "replaced_by_asset_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_1321337024",
    "help": "",
    "hidden": false,
    "id": "relation3880569469",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "replaces_asset_id",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1321337024")

  // remove field
  collection.fields.removeById("relation4077675761")

  // remove field
  collection.fields.removeById("relation3880569469")

  return app.save(collection)
})
