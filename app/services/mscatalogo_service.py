import os
import requests
from app.models import Producto
from app.mapping import ProductoSchema
from tenacity import retry, stop_after_attempt, wait_random

producto_schema = ProductoSchema()
class ClienteCatalogoService:

    def __init__(self):
        self.URL = os.getenv('MSCATALOGO_URL', 'http://localhost:5001/api/v1/')

    @retry(wait=wait_random(min=1, max=2), stop=stop_after_attempt(3))
    def obtener_producto(self, id: int) -> Producto:
        result = None
        r = requests.get(f'http://localhost:5001/api/v1/catalogo/productos/{id}')
        if r.status_code == 200:
            result = producto_schema.load(r.json())
        else:
            raise BaseException("Error en el servicio 1")
        return result