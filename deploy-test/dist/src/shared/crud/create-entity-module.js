"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseEntityService = void 0;
const syncable_crud_service_1 = require("./syncable-crud.service");
class BaseEntityService extends syncable_crud_service_1.SyncableCrudService {
    constructor(model, entityName) {
        super(model, entityName);
    }
}
exports.BaseEntityService = BaseEntityService;
