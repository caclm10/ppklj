/// <reference path="../pb_data/types.d.ts" />

migrate((app) => {
  const collection = app.findCollectionByNameOrId("asset_logs");

  const actionField = collection.fields.find(
    (field) => field.name === "action"
  );
  if (actionField && actionField.type === "select") {
    actionField.values = ["create", "update", "delete"];
  }

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("asset_logs");

  const actionField = collection.fields.find(
    (field) => field.name === "action"
  );
  if (actionField && actionField.type === "select") {
    actionField.values = ["create,update,delete"];
  }

  return app.save(collection);
});
