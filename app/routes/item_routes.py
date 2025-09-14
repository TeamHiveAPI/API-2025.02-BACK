from fastapi import APIRouter, HTTPException
from typing import List
from app.models.item_model import Item, ItemCreate, ItemIncrement
from app.services import item_service

router = APIRouter()

@router.get("/items", response_model=List[Item])
def get_items():
    return item_service.get_all_items()

@router.get("/items/{item_id}", response_model=Item)
def get_item(item_id: int):
    item = item_service.get_item_by_id(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.post("/items", response_model=Item)
def create_new_item(item: ItemCreate):
    created = item_service.create_item(item.dict())
    if not created:
        raise HTTPException(status_code=500, detail="Failed to create item")
    return created

@router.put("/items/{item_id}", response_model=Item)
def increment_item(item_id: int, update: ItemIncrement):
    updated = item_service.increment_item_quantity(item_id, update.qnt_atual)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found or update failed")
    return updated

@router.put("/items/{item_id}/decrement", response_model=Item)
def decrement_item(item_id: int, update: ItemIncrement):
    updated = item_service.decrement_item_quantity(item_id, update.qnt_atual)
    if not updated:
        raise HTTPException(status_code=404, detail="Item not found or update failed")
    return updated

@router.delete("/items/{item_id}", response_model=Item)
def delete_existing_item(item_id: int):
    deleted = item_service.delete_item(item_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Item not found or delete failed")
    return deleted