/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = new Collection({
    "createRule": "@request.auth.id != \"\"",
    "deleteRule": "@request.auth.id != \"\"",
    "fields": [
      {
        "autogeneratePattern": "[a-z0-9]{15}",
        "help": "",
        "hidden": false,
        "id": "text3208210256",
        "max": 15,
        "min": 15,
        "name": "id",
        "pattern": "^[a-z0-9]+$",
        "presentable": false,
        "primaryKey": true,
        "required": true,
        "system": true,
        "type": "text"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_3740433507",
        "help": "",
        "hidden": false,
        "id": "relation4148293319",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "device_model_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text227839714",
        "max": 0,
        "min": 0,
        "name": "serial_number",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3847340049",
        "max": 0,
        "min": 0,
        "name": "hostname",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": true,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text587191692",
        "max": 0,
        "min": 0,
        "name": "ip_address",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text3072911721",
        "max": 0,
        "min": 0,
        "name": "mac_address",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "select2063623452",
        "maxSelect": 0,
        "name": "status",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "select",
        "values": [
          "baik,rusak,rusak berat"
        ]
      },
      {
        "autogeneratePattern": "",
        "help": "",
        "hidden": false,
        "id": "text2662921653",
        "max": 0,
        "min": 0,
        "name": "tahun_pembelian",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2106602331",
        "max": "",
        "min": "",
        "name": "support_until",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "help": "",
        "hidden": false,
        "id": "date2902311062",
        "max": "",
        "min": "",
        "name": "warranty_until",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "convertURLs": false,
        "help": "",
        "hidden": false,
        "id": "editor18589324",
        "maxSize": 0,
        "name": "notes",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "editor"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_1680310438",
        "help": "",
        "hidden": false,
        "id": "relation4288725540",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "office_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "cascadeDelete": false,
        "collectionId": "pbc_576912656",
        "help": "",
        "hidden": false,
        "id": "relation1410822291",
        "maxSelect": 0,
        "minSelect": 0,
        "name": "room_id",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "relation"
      },
      {
        "hidden": false,
        "id": "autodate2990389176",
        "name": "created",
        "onCreate": true,
        "onUpdate": false,
        "presentable": false,
        "system": false,
        "type": "autodate"
      },
      {
        "hidden": false,
        "id": "autodate3332085495",
        "name": "updated",
        "onCreate": true,
        "onUpdate": true,
        "presentable": false,
        "system": false,
        "type": "autodate"
      }
    ],
    "id": "pbc_1321337024",
    "indexes": [
      "CREATE INDEX `idx_lctac8mvux` ON `assets` (`serial_number`) WHERE `serial_number` != \"\"",
      "CREATE INDEX `idx_1xw8p5ddfu` ON `assets` (`hostname`) WHERE `hostname` != \"\"",
      "CREATE INDEX `idx_yaevjrfzcn` ON `assets` (`ip_address`) WHERE `ip_address` != \"\"",
      "CREATE INDEX `idx_q0xu58u5mh` ON `assets` (`mac_address`) WHERE `mac_address` != \"\""
    ],
    "listRule": "@request.auth.id != \"\"",
    "name": "assets",
    "system": false,
    "type": "base",
    "updateRule": "@request.auth.id != \"\"",
    "viewRule": "@request.auth.id != \"\""
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1321337024");

  return app.delete(collection);
})
