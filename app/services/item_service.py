from app.db.supabase_client import supabase
from fastapi import HTTPException

def get_all_items():
    response = supabase.table("item").select("*").execute()
    return response.data

def get_item_by_id(item_id: int):
    response = supabase.table("item").select("*").eq("id_item", item_id).single().execute()
    return response.data

def create_item(item_data: dict):
    response = supabase.table("item").insert(item_data).execute()
    return response.data[0] if response.data else None

def increment_item_quantity(item_id: int, increment_value: int):
    current = supabase.table("item").select("qnt_atual").eq("id_item", item_id).single().execute()

    if not current.data:
        return None

    current_qnt = current.data["qnt_atual"]
    new_qnt = current_qnt + increment_value

    response = supabase.table("item").update({"qnt_atual": new_qnt}).eq("id_item", item_id).execute()
    return response.data[0] if response.data else None

def decrement_item_quantity(item_id: int, decrement_value: int):
    current = supabase.table("item").select("qnt_atual").eq("id_item", item_id).single().execute()

    if not current.data:
        return None

    current_qnt = current.data["qnt_atual"]
    new_qnt = current_qnt - decrement_value
   
    if new_qnt < 0:
        raise HTTPException(status_code=400, detail="Resultado negativo")

    response = supabase.table("item").update({"qnt_atual": new_qnt}).eq("id_item", item_id).execute()
    return response.data[0] if response.data else None

def delete_item(item_id: int):
    response = supabase.table("item").delete().eq("id_item", item_id).execute()
    return response.data[0] if response.data else None