import os
import logging
import requests
from tenacity import retry, stop_after_attempt, wait_random
from app.mapping import CompraSchema
from app.models import Compra, Producto

class ClienteComprasService:
    
    def __init__(self):
        self.compra = Compra()
        self.URL = os.getenv('MSCOMPRAS_URL', 'http://localhost:5003/api/v1/')

    @retry(wait=wait_random(min=1, max=2), stop=stop_after_attempt(3))
    def comprar(self, producto: Producto, direccion_envio: str) -> None:
        self.compra.producto = producto.id
        self.compra.direccion_envio = direccion_envio
        compra_schema = CompraSchema()
        data=compra_schema.dump(self.compra)
        logging.info(data)
        # Eliminamos el campo "id" si está presente
        data.pop("id", None)        
        data.pop("deleted_at", None)
        r = requests.post(f'{self.URL}compras', json=data )
        if r.status_code == 200:
            logging.info(f"Compra <- {r.json()}")
           
            self.compra = compra_schema.load( r.json() )
            logging.info(f"Compra realizada id: {self.compra.id}")
        else:
            logging.error(f"Error en el microservicio compras")
            raise BaseException("Error en el microservicio compras")

    @retry(wait=wait_random(min=1, max=2), stop=stop_after_attempt(3))
    def cancelar_compra(self) -> None:
        
        if not self.compra.id:
            logging.error("No se puede cancelar una compra sin id")
            raise BaseException("No se puede cancelar una compra sin id")
        
        r = requests.delete(f'{self.URL}compras/{self.compra.id}')
        if r.status_code == 200:
            logging.warning(f"Compra eliminada id: {self.compra.id}")
        else:
            logging.error("Error tratando de compensar Compras")
            raise BaseException("Error tratando de compensar Compras")