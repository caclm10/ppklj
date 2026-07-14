/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3289533247")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_mr91286sxx` ON `pic` (\n  `whatsapp_number`,\n  `nip`,\n  `email`\n)"
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3289533247")

  // update collection data
  unmarshal({
    "indexes": []
  }, collection)

  return app.save(collection)
})
