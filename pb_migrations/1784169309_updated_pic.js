/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3289533247")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_mr91286sxx` ON `pic` (`whatsapp_number`) WHERE `whatsapp_number` != \"\"",
      "CREATE UNIQUE INDEX `idx_qyiyvwyick` ON `pic` (`nip`) WHERE `nip` != \"\"\n",
      "CREATE UNIQUE INDEX `idx_04wl3pua0t` ON `pic` (`email`) WHERE `email` != \"\""
    ]
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3289533247")

  // update collection data
  unmarshal({
    "indexes": [
      "CREATE UNIQUE INDEX `idx_mr91286sxx` ON `pic` (`whatsapp_number`)",
      "CREATE UNIQUE INDEX `idx_qyiyvwyick` ON `pic` (`nip`)",
      "CREATE UNIQUE INDEX `idx_04wl3pua0t` ON `pic` (`email`)"
    ]
  }, collection)

  return app.save(collection)
})
