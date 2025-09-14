from pydantic import BaseModel

class Item(BaseModel):
    id_item: int
    nome: str
    num_ficha: int
    unidade: str
    qnt_atual: int
    min_estoque: int
    grupo: str

class ItemCreate(BaseModel):
    nome: str
    num_ficha: int
    unidade: str
    qnt_atual: int
    min_estoque: int
    grupo: str

class ItemIncrement(BaseModel):
    qnt_atual: int